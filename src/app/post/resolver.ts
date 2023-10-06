import { Post } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../types";



interface CreatePostPayload {
  content: string;
  imageURL?: string;
}

const mutations = {
    createPost: async (
    parent: any,
    { payload }: { payload: CreatePostPayload },
    ctx: GraphqlContext
  ) => {
    console.log(ctx)
    if (!ctx.user) {
      throw new Error("Invalid creadentials");
    } else {
      const post = await prismaClient.post.create({
        data: {
          content: payload.content,
          imageURL: payload.imageURL,
          author: { connect: { id: ctx.user.id } },
        },
      });
      return post
    }
  },
};


const queries={
    getAllPosts:()=>prismaClient.post.findMany({orderBy:{createdAt:"desc"}})

}

const extraResolver={
    Post :{
        author:(parent:Post) =>prismaClient.user.findUnique({where:{id:parent.authorid}})
    }
}
export const resolvers={mutations, extraResolver , queries}