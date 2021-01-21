import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { authorizeToken } from "../../services/util/authorizer";
import { Connection, Repository } from "typeorm";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { Notice } from "../../src/entity/Entity";

/**
 * @api {put}  /cms/notice/createNotice     create notice
 * @apiName Create Notice
 * @apiGroup CMS
 *
 * @apiParam (Header)   {string} AuthArization                                        Bearer Token
 * @apiParam (Body)     {string} title                                                notice title
 * @apiParam (Body)     {string} category                                             notice category
 * @apiParam (Body)     {string} content                                              notice content
 * @apiParam (Body)     {boolean} publish=false                                       notice publish
 * @apiParam (Body)     {boolean} pushNotification=false                              notice push notification
 * @apiParamExample Request
 {
	"title": "notice test",
	"category": "new",                  
  "content": "notice test content",
  "publish": true,
  "pushNotification": true                                              
}
 **/
const createNotice = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const connection: Connection = await getDatabaseConnection();
  const noticeRepository: Repository<Notice> = connection.getRepository(Notice);
  const {
    title,
    category,
    pushNotification = false,
    publish = false,
    content,
  } = JSON.parse(event.body);

  if (title == null || content == null) {
    return {
      statusCode: 500,
      body: "",
    };
  }

  let notice: Notice = new Notice();
  notice.title = title;
  notice.category = category;
  notice.pushNotification = pushNotification;
  notice.publish = publish;
  notice.content = content;

  await noticeRepository.save(notice);

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {put}  /cms/notice/modifyNotice     modify notice
 * @apiName Modify Notice
 * @apiGroup CMS
 *
 * @apiParam (Header)               {string} AuthArization                      Bearer Token
 * @apiParam (PathParam)            {number} id                                 notice id
 * @apiParamExample Request
 {
	"title": "notice test",
	"category": "new",                  
  "content": "notice test content",
  "publish": true,
  "pushNotification": true                                              
}
 **/
const modifyNotice = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const noticeId: number = Number(event.pathParameters["id"]);
  const {
    title,
    category,
    pushNotification = false,
    publish = false,
    content,
  } = JSON.parse(event.body);
  const connection: Connection = await getDatabaseConnection();
  const noticeRepository: Repository<Notice> = connection.getRepository(Notice);
  const noticeEntity: Notice = await noticeRepository.findOne({ id: noticeId });
  if (noticeEntity == null) {
    return {
      statusCode: 500,
      body: "",
    };
  }

  noticeEntity.title = title;
  noticeEntity.category = category;
  noticeEntity.pushNotification = pushNotification;
  noticeEntity.publish = publish;
  noticeEntity.content = content;
  noticeRepository.save(noticeEntity);

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {get}  /cms/notice/deleteNotice     delete notice
 * @apiName Delete Notice
 * @apiGroup CMS
 *
 * @apiParam (Header)               {string} AuthArization                      Bearer Token
 * @apiParam (PathParam)            {number} id                                 notice id
 **/
const deleteNotice = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const noticeId: number = Number(event.pathParameters["id"]);
  const connection: Connection = await getDatabaseConnection();
  const noticeRepository: Repository<Notice> = connection.getRepository(Notice);
  const noticeEntity: Notice = await noticeRepository.findOne({ id: noticeId });
  if (noticeEntity == null) {
    return {
      statusCode: 500,
      body: "",
    };
  }

  await noticeRepository.delete({ id: noticeId });
  return {
    statusCode: 200,
    body: "",
  };
};

const wrappedCreateNotice = middy(createNotice)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedModifyNotice = middy(modifyNotice)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedDeleteNotice = middy(deleteNotice)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());

export {
  wrappedCreateNotice as createNotice,
  wrappedModifyNotice as modifyNotice,
  wrappedDeleteNotice as deleteNotice,
};