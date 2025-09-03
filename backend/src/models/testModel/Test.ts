// import { getModelForClass, prop, Ref, mongoose } from "@typegoose/typegoose";
// import { Schema, model } from "mongoose";

// // ------------------- Product -------------------
// // class Product {
// //   @prop()
// //   public name!: string;
// // }

// // export const ProductModel = getModelForClass(Product);

// // ------------------- BlogPost -------------------
// class BlogPost {
//   @prop()
//   public title!: string;
// }

// export const BlogPostModel = getModelForClass(BlogPost);

// // ------------------- Comment -------------------
// class Comment {
//   @prop({ required: true })
//   public body!: string;

//   @prop({
//     required: true,
//     refPath: "onModel", // polymorphic reference field
//   })
//   public on!: Ref<Product | BlogPost>;

//   @prop({
//     required: true,
//     enum: ["Product", "BlogPost"],
//   })
//   public onModel!: "Product" | "BlogPost";
// }

// export const CommentModel = getModelForClass(Comment);
