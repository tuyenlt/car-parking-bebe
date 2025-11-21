import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";
import {
  FIELD_SORT_DEFAULT,
  ORDER_DIRECTION,
  PAGINATION_PAGE_DEFAULT,
  PAGINATION_PAGE_SIZE,
} from "../constants/common.constant";

@Injectable()
export class ModifyPagingFilterPipe implements PipeTransform {
  constructor() {
    //
  }
  transform(data: Record<string, unknown>, metadata: ArgumentMetadata) {
    if (metadata.type === "query") {
      if (!data.page) {
        data.page = PAGINATION_PAGE_DEFAULT;
      }
      if (!data.per_page) {
        data.per_page = PAGINATION_PAGE_SIZE;
      }

      if (!data.sort_by) {
        data.sort_by = FIELD_SORT_DEFAULT;
      }

      if (!data.order_direction) {
        data.order_direction = ORDER_DIRECTION.ASC;
      }

      Object.keys(data).forEach((key) => {
        switch (key) {
          case "true":
            data[key] = true;
            break;
          case "false":
            data[key] = false;
            break;
          default:
            break;
        }
      });

      return {
        ...(data as Record<string, unknown>),
        page: Number(data.page),
        per_page: Number(data.per_page),
      };
    }
    return data;
  }
}
