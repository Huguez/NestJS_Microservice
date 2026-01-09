import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma.service';
import { Pagination } from 'src/common/dto';

@Injectable()
export class ProductsService {

   constructor(
      private prisma: PrismaService
   ) { }

   async create(createProductDto: CreateProductDto) {
      const product = await this.prisma.product.create({ data: createProductDto })
      return product;
   }

   async findAll(pagination: Pagination) {
      const { limit = 5, page = 1 } = pagination

      const total = await this.prisma.product.count();

      const products = await this.prisma.product.findMany({
         skip: (page - 1) * limit,
         take: limit
      })
      
      return {
         lastPage: Math.ceil( total/limit ),
         totalProducts: total,
         products,
      }
   }

   findOne(id: number) {
      return `This action returns a #${id} product`;
   }

   update(id: number, updateProductDto: UpdateProductDto) {
      return `This action updates a #${id} product`;
   }

   remove(id: number) {
      return `This action removes a #${id} product`;
   }
}
