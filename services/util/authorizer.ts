import { getDatabaseConnection } from "../../src/connection/Connection";
import { User } from "../../src/entity/Entity";
import { MiddlewareObject, HandlerLambda, NextFunction } from "middy";
import * as admin from "firebase-admin";

const authorizeToken = (): MiddlewareObject<any, any> => {
  return {
    before: async (handler: HandlerLambda, next: NextFunction) => {
      const connection = await getDatabaseConnection();
      const userRepository = connection.getRepository(User);

      const serviceAccount = require("../../../../Downloads/artalleys-gn-78385-firebase-adminsdk-9jh66-d8a4bb8e92.json");

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: "",
        });
      }

      if (!handler.event || !handler.event.headers["authorization"]) {
        return new Error("token missing");
      }

      const token: string = handler.event.headers["authorization"];
      let uid: string;
      let phoneNumber: string;

      await admin
        .auth()
        .verifyIdToken(token)
        .then((decodedToken) => {
          uid = decodedToken.uid;
          phoneNumber = decodedToken.phone_number;
          return;
        })
        .catch((error) => {
          return new Error("token expiration");
        });

      const userEntity: User = await userRepository.findOne({ uid: uid });
      let user: User = new User();

      if (userEntity == null) {
        user.uid = uid;
        user.phoneNumber = phoneNumber;

        userRepository.save(user);
        return;
      }

      return;
    },
  };
};

export { authorizeToken };