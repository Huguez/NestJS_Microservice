import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, Min } from "class-validator";

export class Pagination {

   @IsOptional()
   @IsInt()
   @Min(1)
   @Type( () => Number )
   public page?: number = 1

   @IsPositive()
   @IsOptional()
   @IsInt()
   @Min(1)
   @Type( () => Number )
   public limit?: number = 5
}