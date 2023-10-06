import axios from "axios";
import { prismaClient } from "../../clients/db";
import JwtService from "../../services/jwt";
import { GraphqlContext } from "../../types";
import { User } from "@prisma/client";

interface GoogleTokenResult {
  iss?: string;
  azp?: string;
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string;
  nbf?: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  iat?: string;
  exp?: string;
  jti?: string;
  alg?: string;
  kid?: string;
  typ?: string;
}

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const googleToken = token;
    const googleOauthUrl = new URL("https://oauth2.googleapis.com/tokeninfo");
    googleOauthUrl.searchParams.set("id_token", googleToken);


    const { data } = await axios.get<GoogleTokenResult>(
      googleOauthUrl.toString(),
      {
        responseType: "json",
      }
    );
    const existUser = await prismaClient.user.findFirst({
      where: { email: data.email },
    });
    if (!existUser && data.email && data.given_name && data.family_name) {
      await prismaClient.user.create({
        data: {
          email: data.email,
          firstName: data.given_name,
          lastName: data.family_name,
          profileImageUrl: data.picture,
        },
      });
    }

    const userInDb = await prismaClient.user.findFirst({
      where: { email: data.email },
    });
    let tokengen;
    if (userInDb) {
      tokengen = JwtService.generateTokenForUser(userInDb);
    } else {
      throw new Error("User with email not found");
    }
    return tokengen;
  },

  getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    const id = ctx.user?.id;
    const user = await prismaClient.user.findUnique({ where: { id } });
    return user;
  },
};


const extraResolver ={
    User:{
        posts: (parent:User)=> prismaClient.post.findMany({where:{authorid:parent.id}})

        
    }
    
    
   
}
export const resolvers = { queries ,extraResolver};
