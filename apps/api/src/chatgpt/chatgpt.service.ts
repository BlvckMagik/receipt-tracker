import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

export interface ReceiptAnalysis {
  store: string;
  date: string;
  time: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  change_amount: number;
  check_number: string;
  items: Array<{
    name: string;
    qty: number;
    unit_price: number;
    line_total: number;
    category: string;
  }>;
  categories: Array<{
    name: string;
    total: number;
    items: string[];
  }>;
}

@Injectable()
export class ChatgptService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeReceipt(imagePath: string): Promise<ReceiptAnalysis> {
    try {
      console.log('Початок аналізу чеку за допомогою ChatGPT для файлу:', imagePath);
      
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      
      const prompt = `Проаналізуй цей чек та надай мені детальну інформацію в JSON форматі. 

Потрібно витягти:
1. Назву магазину/закладу
2. Дату та час покупки
3. Загальну суму, підсумок, податок
4. Валюту
5. Суму здачі (якщо є)
6. Номер чеку
7. Список всіх куплених товарів з кількістю, ціною за одиницю та загальною вартістю
8. Категорії товарів (їжа, напої, одяг, електроніка, тощо)
9. Розбивку по категоріях з сумами

Відповідь має бути в JSON форматі з такою структурою:
{
  "store": "назва магазину",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "subtotal": число,
  "tax": число,
  "total": число,
  "currency": "UAH",
  "change_amount": число,
  "check_number": "номер чеку",
  "items": [
    {
      "name": "назва товару",
      "qty": кількість,
      "unit_price": ціна_за_одиницю,
      "line_total": загальна_ціна,
      "category": "категорія"
    }
  ],
  "categories": [
    {
      "name": "назва категорії",
      "total": сума_по_категорії,
      "items": ["список товарів"]
    }
  ]
}

Якщо якась інформація відсутня, використовуй null або порожній рядок.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('ChatGPT не повернув відповідь');
      }

      console.log('ChatGPT відповідь:', content);

      try {
        const parsed = JSON.parse(content);
        console.log('Успішно розпарсено JSON від ChatGPT');
        return parsed as ReceiptAnalysis;
      } catch (parseError) {
        console.error('Помилка парсингу JSON від ChatGPT:', parseError);
        console.log('Сирий контент:', content);
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed as ReceiptAnalysis;
          } catch (secondParseError) {
            console.error('Друга спроба парсингу також невдала:', secondParseError);
          }
        }
        
        throw new Error('Не вдалося розпарсити JSON від ChatGPT');
      }
    } catch (error) {
      console.error('Помилка аналізу чеку ChatGPT:', error);
      throw error;
    }
  }
}
