import { Injectable, Logger } from '@nestjs/common';
import { CreateNutritionDto } from './dto/create-nutrition.dto';
import { UpdateNutritionDto } from './dto/update-nutrition.dto';
import * as fs from 'fs';

@Injectable()

export class NutritionService {

  private readonly logger = new Logger(NutritionService.name);

  private readonly apiKey = process.env.GOOGLE_API_KEY;
  private readonly apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${this.apiKey}`;

  create(createNutritionDto: CreateNutritionDto) {
    return 'This action adds a new nutrition';
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


  async analyzeImages(files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new Error('No files uploaded.');

    // 👉 Chuyển file sang base64
    const base64Images = files.map((file) => {
      const mimeType = file.mimetype || 'image/jpeg';
      const base64Data = file.buffer.toString('base64'); // ✅ Dùng buffer thay vì fs.readFileSync
      return {
        inline_data: {
          mime_type: mimeType,
          data: base64Data,
        },
      };
    });

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `
              Phân tích tất cả các món ăn trong những ảnh được cung cấp. 
              Trả về một đối tượng JSON hợp lệ bao gồm:
              {
                items: [{ name, quantity, calories, protein_g, carbs_g, fat_g }],
                total_nutrition: { calories, protein_g, carbs_g, fat_g }
              }
              Không bao gồm ký tự \`\`\`json ở đầu hoặc \`\`\` ở cuối.
            `,
            },
            ...base64Images,
          ],
        },
      ],
      generation_config: {
        response_mime_type: 'application/json',
      },
    };

    const response = await fetch(`${this.apiUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      Logger.debug(err)
      throw new Error(`Gemini API returned ${response.status}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No nutrition data returned');

    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (err) {
      // this.logger.error('Failed to parse JSON:', text);
      throw new Error('Invalid JSON returned from Gemini');
    }
  }
}

