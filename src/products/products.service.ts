import { BadRequestException, HttpCode, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma.service';
import { Pagination } from 'src/common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {

   private logger = new Logger("ProductsService")

   constructor(
      private prisma: PrismaService
   ) { }

   async create(createProductDto: CreateProductDto) {
      try {
         const product = await this.prisma.product.create({ data: createProductDto })
         return product;
      } catch (error) {
         this.handlerExceptions(error)
      }
   }

   async findAll(pagination: Pagination) {
      try {
         const { limit = 5, page = 1 } = pagination

         const total = await this.prisma.product.count({ where: { available: true } });

         const products = await this.prisma.product.findMany({
            where: {
               available: true
            },
            skip: (page - 1) * limit,
            take: limit
         })

         return {
            lastPage: Math.ceil(total / limit),
            totalProducts: total,
            products,
         }
      } catch (error) {
         this.handlerExceptions(error)
      }
   }

   async findOne(id: number) {
      try {
         const product = await this.prisma.product.findFirst({
            where: {
               id,
               available: true
            }
         })

         if (!product) {
            throw new NotFoundException(`Product with id: ${id}, not found`)
         }

         return {
            product
         }
      } catch (error) {
         this.handlerExceptions(error)
      }
   }

   async update(id: number, updateProductDto: UpdateProductDto) {
      try {
         const { id:_, ...productData } = updateProductDto
         
         await this.findOne(id);

         return {
            product: await this.prisma.product.update({
               where: {
                  id
               },
               data: {
                  ...productData
               },
            })
         }
      } catch (error) {
         this.handlerExceptions(error);
      }
   }

   async remove(id: number) {
      try {
         await this.findOne(id);

         return {
            productDeleted: !!await this.prisma.product.update({
               where: { id },
               data: {
                  available: false,
               }
            })
         };
      } catch (error) {
         this.handlerExceptions(error)
      }
   }

   private handlerExceptions(error: any) {

      if (error.status === 404) {
         throw new NotFoundException(error.message)
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
         if (error.code === 'P2002') {
            throw new BadRequestException('Error: instance/attribute duplicate')
         }
      } else if (error instanceof Prisma.PrismaClientRustPanicError) {
         throw new InternalServerErrorException('Error: Prisma engine fail.')
      } else {
         this.logger.error(error.message);
         throw new InternalServerErrorException("Check Logs")
      }
   }
}
