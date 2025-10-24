import { Injectable, Logger } from '@nestjs/common';
import { CreateAiDto } from './dto/create-ai.dto';
import { UpdateAiDto } from './dto/update-ai.dto';

interface NutritionItem {
  name: string;
  quantity: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface NutritionResponse {
  items: NutritionItem[];
  total_nutrition: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async analyzeImages(base64Images: string[]) {
    // : Promise<NutritionResponse>

    // base64Images: string[]

    // const apikey = "AIzaSyDHyTC014t7KJ9YmrAjfzJe1zRCs1MecMc"
    // // Build inline data parts for each image
    // const imageParts = base64Images.map((base64Image) => {
    //   // If the string is a data URI like 'data:image/png;base64,...' extract the mime type
    //   const matches = base64Image.match(/^data:(image\/[^;]+);base64,(.*)$/i);
    //   const mimeType = matches ? matches[1] : 'image/jpeg';
    //   const data = matches ? matches[2] : base64Image.split(',')[1] ?? base64Image;
    //   return {
    //     inline_data: {
    //       mime_type: mimeType,
    //       data,
    //     },
    //   };
    // });

    // const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apikey}`;

    // const payload = {
    //   contents: [
    //     {
    //       parts: [
    //         {
    //           text:
    //             "Phân tích tất cả các món ăn trong những ảnh được cung cấp. Trả về một đối tượng JSON hợp lệ bao gồm danh sách tổng hợp tất cả các món ăn ('items') và tổng giá trị dinh dưỡng ('total_nutrition') cho toàn bộ bữa ăn. Với mỗi món ăn, hãy ước tính tên, số lượng, calo, protein, carb và fat. Không bao gồm ký tự ```json ở đầu hoặc ``` ở cuối.",
    //         },
    //         ...imageParts,
    //       ],
    //     },
    //   ],
    //   generation_config: {
    //     response_mime_type: 'application/json',
    //     response_schema: {
    //       type: 'OBJECT',
    //       properties: {
    //         items: {
    //           type: 'ARRAY',
    //           items: {
    //             type: 'OBJECT',
    //             properties: {
    //               name: { type: 'STRING' },
    //               quantity: { type: 'STRING' },
    //               calories: { type: 'NUMBER' },
    //               protein_g: { type: 'NUMBER' },
    //               carbs_g: { type: 'NUMBER' },
    //               fat_g: { type: 'NUMBER' },
    //             },
    //             required: ['name', 'quantity', 'calories', 'protein_g', 'carbs_g', 'fat_g'],
    //           },
    //         },
    //         total_nutrition: {
    //           type: 'OBJECT',
    //           properties: {
    //             calories: { type: 'NUMBER' },
    //             protein_g: { type: 'NUMBER' },
    //             carbs_g: { type: 'NUMBER' },
    //             fat_g: { type: 'NUMBER' },
    //           },
    //           required: ['calories', 'protein_g', 'carbs_g', 'fat_g'],
    //         },
    //       },
    //       required: ['items', 'total_nutrition'],
    //     },
    //   },
    // } as const;

    // const response = await fetch(apiUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    // });

    // if (!response.ok) {
    //   const errorBody = await response.json().catch(() => null);
    //   this.logger.error('AI API error', errorBody ?? (await response.text()));
    //   throw new Error(`API returned ${response.status}`);
    // }

    // const result = await response.json();
    // const candidate = result.candidates?.[0];
    // const contentText = candidate?.content?.parts?.[0]?.text;

    // if (!contentText) throw new Error('No content returned from AI API');

    // const nutritionData = JSON.parse(contentText) as NutritionResponse;
    // return nutritionData;

    console.log ("analyst")
  }

  create(createAiDto: CreateAiDto) {
    return 'This action adds a new ai';
  }

  findAll() {
    return `This action returns all ai`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ai`;
  }

  update(id: number, updateAiDto: UpdateAiDto) {
    return `This action updates a #${id} ai`;
  }

  remove(id: number) {
    return `This action removes a #${id} ai`;
  }
}
