import { BadRequestException, Body, Injectable, Logger } from '@nestjs/common';
import { CreateNutritionDto } from './dto/create-nutrition.dto';
import { UpdateNutritionDto } from './dto/update-nutrition.dto';
import * as fs from 'fs';
import axios from 'axios';
import { Nutrition, NutritionDocument } from './entities/nutrition.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { EXERCISE_INTENSITY_FACTOR } from '../user/entities/user.schema';
import { UpdateUserDto } from '../user/dto/update-user.dto';


const MACRO_RATIO_LOSE = { PROTEIN: 0.35, FAT: 0.25, CARB: 0.40 };
const MACRO_RATIO_GAIN = { PROTEIN: 0.30, FAT: 0.20, CARB: 0.50 };
const MACRO_RATIO_MAINTAIN = { PROTEIN: 0.25, FAT: 0.30, CARB: 0.45 };

const CALORIES_PER_KG_WEIGHT_CHANGE = 7000; // Giá trị trung bình để giảm/tăng 1 kg

const MIN_FEMALE_CALORIES = 1200;
const MIN_MALE_CALORIES = 1500;



@Injectable()
export class NutritionService {

  private readonly logger = new Logger(NutritionService.name);

  private readonly apiKey = process.env.GOOGLE_API_KEY;
  private readonly apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${this.apiKey}`;

  constructor(@InjectModel(Nutrition.name) private nutritionModel: Model<NutritionDocument>) {
    console.log("Nutrition service initialized");
  }

  async create(createNutritionDto: CreateNutritionDto) {
    return await this.nutritionModel.create(createNutritionDto);
  }

  findAll() {
    return `This action returns all nutrition`;
  }

  findOne(id: number) {
    return `This action returns a #${id} nutrition`;
  }

  update(id: number, updateNutritionDto: UpdateNutritionDto) {
    return `This action updates a #${id} nutrition`;
  }

  remove(id: number) {
    return `This action removes a #${id} nutrition`;
  }


  handleImageUpload(file: Express.Multer.File) {

  }


  async analyzeImages(files: Express.Multer.File[]): Promise<CreateNutritionDto> {
    if (!files || files.length === 0) throw new Error('No files uploaded.');

    // 👉 Chuyển file sang base64
    const base64Images = files.map((file) => {
      const mimeType = file.mimetype || 'image/jpeg';
      // ✅ Dùng buffer.toString('base64') là đúng cho Multer
      const base64Data = file.buffer.toString('base64');
      return {
        inline_data: {
          mime_type: mimeType,
          data: base64Data,
        },
      };
    });

    // Định nghĩa Schema (khuyến nghị cho độ tin cậy cao nhất, nhưng chưa thể thêm vào prompt)
    const jsonSchema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          total_nutrition: {
            type: "object",
            properties: {
              calories: { type: "number" },
              protein_g: { type: "number" },
              carbs_g: { type: "number" },
              fat_g: { type: "number" },
            },
            required: ["calories", "protein_g", "carbs_g", "fat_g"],
          },
        },
        required: ["name", "total_nutrition"],
      }
    };

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Phân tích tất cả các món ăn trong những ảnh được cung cấp. 
                      Trả về **một MẢNG JSON** hợp lệ theo cấu trúc Schema sau cho món ăn chính. 
                                CHỈ trả về JSON thuần, KHÔNG kèm lời giải thích, ký hiệu \`\`\`json, hay văn bản thừa nào khác.
                                [
                                  {
                                    "name": "food_name",
                                    "total_nutrition": { 
                                      "calories": number, 
                                      "protein_g": number, 
                                      "carbs_g": number, 
                                      "fat_g": number 
                                    }
                                  }
                                ]
                            `,
            },
            ...base64Images,
          ],
        },
      ],
      generation_config: {
        response_mime_type: 'application/json',
        // response_schema: jsonSchema,
      },
    };

    const response = await axios.post(
      `${this.apiUrl}`, 
      JSON.stringify(payload),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.data) {
      Logger.debug(response.statusText);
      throw new Error(`Gemini API returned ${response.status}`);
    }

    const result = response.data;
    console.log("Result from gemini ", result);

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No nutrition data returned');

    try {
      let cleanedText = text.trim();

      // Loại bỏ các delimiters như ```json...``` mà mô hình có thể vô tình thêm vào
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;
      const match = jsonRegex.exec(cleanedText);

      if (match && match[1]) {
        cleanedText = match[1].trim();
      } else {
        // Loại bỏ bất kỳ ký tự trắng/ngắt dòng nào xung quanh
        cleanedText = cleanedText.replace(/^[\s\r\n]+|[\s\r\n]+$/g, '');
      }

      // Xử lý trường hợp toàn bộ JSON bị bọc trong dấu ngoặc kép (trở thành một chuỗi)
      if (cleanedText.startsWith('"') && cleanedText.endsWith('"')) {
        cleanedText = JSON.parse(cleanedText);
      }

      const parsedArray = JSON.parse(cleanedText);

      // Lấy phần tử đầu tiên (vì chúng ta yêu cầu một mảng JSON có 1 đối tượng)
      const parsed = Array.isArray(parsedArray) ? parsedArray[0] : parsedArray;

      if (!parsed || !parsed.name) throw new Error('Parsed data missing core fields.');

      console.log("Parsed data ", parsed);

      const mealDto = new CreateNutritionDto();
      mealDto.foodName = parsed.name || 'Không xác định';
      // Đảm bảo kiểu dữ liệu là number khi lấy ra
      mealDto.calories = Number(parsed.total_nutrition?.calories) || 0;
      mealDto.protein = Number(parsed.total_nutrition?.protein_g) || 0;
      mealDto.carbs = Number(parsed.total_nutrition?.carbs_g) || 0;
      mealDto.fat = Number(parsed.total_nutrition?.fat_g) || 0;
      return mealDto;
    } catch (err) {
      // Báo lỗi chi tiết để debug
      Logger.error(`Lỗi phân tích JSON: ${err.message}`, 'GeminiAnalysis');
      Logger.error(`Văn bản thô không hợp lệ: ${text}`, 'GeminiAnalysis');
      throw new Error('Invalid JSON returned from Gemini');
    }
  }

  async calculateNutritionGoals(user: UpdateUserDto) {
    const { gender, weight, height, birthday, activityLevel, target, targetWeight, targetTimeDays } = user;

    // 1. Kiểm tra Tham số (Giữ nguyên)
    if (gender === undefined || !weight || !height || !birthday || !activityLevel || !target) {
      throw new BadRequestException("Missing required user parameters.");
    }

    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const isMale = gender === true;
    const bmr = isMale
      ? (10 * weight) + (6.25 * height) - (5 * age) + 5
      : (10 * weight) + (6.25 * height) - (5 * age) - 161;

    const factor = EXERCISE_INTENSITY_FACTOR[activityLevel] ?? 1.2;
    const totalTDEE_Fixed = bmr * factor;

    // TDEE NỀN TẢNG (Base TDEE - TDEE chỉ cho Sedentary)
    const TDEE_BASE_FACTOR = 1.2;
    const totalTDEE_Base = bmr * TDEE_BASE_FACTOR;

    // 5. Tính Calo Tập luyện Nền tảng (Mục tiêu Vận động Tối thiểu)
    const baseExerciseGoal = Math.max(0, totalTDEE_Fixed - totalTDEE_Base);


    let dailyCaloriesGoal: number;
    let currentMacroRatio: any;
    let dailyAdjustmentKcal = 0; // Mức thâm hụt/thặng dư được tính toán

    // 6. Tính toán Thâm hụt/Thặng dư DỰA VÀO MỤC TIÊU CÂN NẶNG
    if (target === 'maintain') {
      dailyCaloriesGoal = totalTDEE_Fixed;
      currentMacroRatio = MACRO_RATIO_MAINTAIN;
      dailyAdjustmentKcal = 0;

    } else {
      if (!targetWeight || !targetTimeDays || targetTimeDays <= 0) {
        throw new BadRequestException("Target weight and target time are required for this goal.");
      }

      const totalWeightChange = targetWeight - weight;
      const totalCaloriesChange = Math.abs(totalWeightChange) * CALORIES_PER_KG_WEIGHT_CHANGE;
      dailyAdjustmentKcal = totalCaloriesChange / targetTimeDays;

      // 6A. Giảm cân (Lose)
      if (target === 'lose') {
        currentMacroRatio = MACRO_RATIO_LOSE;

        const maxDeficit = Math.min(dailyAdjustmentKcal, 1000);
        dailyCaloriesGoal = totalTDEE_Fixed - maxDeficit;

        const minLimit = isMale ? MIN_MALE_CALORIES : MIN_FEMALE_CALORIES;
        dailyCaloriesGoal = Math.max(minLimit, dailyCaloriesGoal);

      }
      else if (target === 'gain') {
        currentMacroRatio = MACRO_RATIO_GAIN;

        const maxSurplus = Math.min(dailyAdjustmentKcal, 500);
        dailyCaloriesGoal = totalTDEE_Fixed + maxSurplus;
      } else {
        throw new BadRequestException("Invalid target value.");
      }
    }

    const goal = Math.round(dailyCaloriesGoal);

    const proteinKcal = goal * currentMacroRatio.PROTEIN;
    const fatKcal = goal * currentMacroRatio.FAT;
    const carbKcal = goal * currentMacroRatio.CARB;

    const proteinGrams = proteinKcal / 4;
    const fatGrams = fatKcal / 9;
    const carbGrams = carbKcal / 4;

    return {
      totalTDEE: Math.round(totalTDEE_Fixed),
      dailyCaloriesGoal: goal,
      bmr: Math.round(bmr),
      suggestedActivityKcal: Math.round(baseExerciseGoal),
      macroGoals: {
        protein: Math.round(proteinGrams),
        fat: Math.round(fatGrams),
        carb: Math.round(carbGrams),
        ratio: currentMacroRatio,
        dailyAdjustmentKcal: Math.round(dailyAdjustmentKcal)
      }
    };
  }


  async findMealsByDay(userId: string, dateStr?: string) {
    if (!userId) throw new BadRequestException('userId is required');

    const date = dateStr ? new Date(dateStr) : new Date();
    // normalize to start of day (local time)
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    return this.nutritionModel
      .find({ userId: userId.toString(), createdAt: { $gte: start, $lt: end } })
      .sort({ createdAt: 1 })
      .lean()
      .exec();
  }
}

