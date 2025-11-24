import { ApiProperty } from '@nestjs/swagger';

export class ImageResultDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any; // car2.jpg

  @ApiProperty({ example: '2025-09-09 23:22:38.030345' })
  timestamp: string;

  @ApiProperty({ example: null, required: false })
  camera_id?: string | null;

  @ApiProperty({
    description: 'JSON string of results[]',
    example: JSON.stringify([
      {
        box: { xmin: 586, ymin: 656, xmax: 827, ymax: 708 },
        plate: 'fm046sc',
        region: { code: 'fr', score: 0.655 },
        score: 0.999,
        candidates: [
          { score: 0.999, plate: 'fm046sc' },
          { score: 0.863, plate: 'fmo46sc' }
        ],
        dscore: 0.876,
        vehicle: {
          score: 0.968,
          type: 'Sedan',
          box: { xmin: 260, ymin: 288, xmax: 1205, ymax: 939 }
        },
        model_make: [{ make: 'Generic', model: 'Unknown', score: 0.036 }],
        color: [
          { color: 'blue', score: 0.899 },
          { color: 'white', score: 0.014 }
        ],
        orientation: [
          { orientation: 'Rear', score: 0.878 },
          { orientation: 'Front', score: 0.07 }
        ],
        direction: 87,
        direction_score: 1.0
      }
    ])
  })
  results: string; // JSON string

  @ApiProperty({
    description: 'JSON string for usage',
    example: JSON.stringify({
      calls: 4,
      max_calls: 25000
    })
  })
  usage: string; // JSON string

  @ApiProperty({ example: 29.83 })
  processing_time: number;
}
