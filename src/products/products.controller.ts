import { Controller, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Pagination } from 'src/common/dto';

@Controller('products')
export class ProductsController {

  constructor(private readonly productsService: ProductsService) { }

  @MessagePattern({ cmd: "create_product" })
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @MessagePattern({ cmd: "get_all_product" })
  findAll(@Payload() pagination: Pagination) {
    return this.productsService.findAll(pagination);
  }

  @MessagePattern({ cmd: "get_product_by_id" })
  findOne(@Payload('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @MessagePattern({ cmd: "update_product" })
  update(@Payload() updateProductDto: UpdateProductDto) {
    return this.productsService.update(updateProductDto.id, updateProductDto);
  }

  @MessagePattern({ cmd: "delete_product" })
  remove(@Payload('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @MessagePattern({ cmd: "validate_products" })
  validate(@Payload() ids: number[]) {
    return this.productsService.validateProducts(ids)
  }
}
