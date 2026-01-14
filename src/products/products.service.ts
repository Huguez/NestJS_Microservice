import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma.service';
import { Pagination } from 'src/common/dto';
import { Prisma } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

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
            throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `Product with id: ${id}, not found` })
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
         const { id: _, ...productData } = updateProductDto

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

   async validateProducts(ids: number[]) {
      try {
         const productsIds = Array.from(new Set(ids))

         const products = await this.prisma.product.findMany({
            where: {
               id: {
                  in: productsIds
               }
            }
         })

         if (ids.length !== products.length) {
            throw new RpcException({
               status: HttpStatus.BAD_REQUEST,
               message: "Some Products aren't found"
            });
         }

         return [...products];
      } catch (error) {
         this.handlerExceptions(error);
      }
   }

   private handlerExceptions(error: any) {
      
      if (error.error.status === HttpStatus.NOT_FOUND) {
         throw new RpcException({ status: HttpStatus.NOT_FOUND, message: error.error.message })
      }

      if (error.error.status === HttpStatus.BAD_REQUEST ) {
         throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: error.error.message })
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
         if (error.code === 'P2002') {
            throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: 'Error: instance/attribute duplicate' })
         }
      } else if (error instanceof Prisma.PrismaClientRustPanicError) {
         throw new RpcException({ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error: Prisma engine fail.' })
      } else {
         this.logger.error(error);
         throw new RpcException({ status: HttpStatus.INTERNAL_SERVER_ERROR, message: "Check Logs" })
      }
   }
}
