const {
  DynamoDBClient,
  DeleteItemCommand,
  ConditionalCheckFailedException,
} = require('@aws-sdk/client-dynamodb');

const { marshall} = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient();

const softDeleteEmployee = async (event) => {
  const response = { statusCode: 200 };
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ empId: event.pathParameters.empId }),
      ConditionExpression: 'attribute_exists(empId)',
    };
    const deleteResult = await client.send(new DeleteItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully deleted post.',
      deleteResult,
    });
  } catch (e) {

    if (error instanceof ConditionalCheckFailedException) {
       console.error(e);
       response.statusCode = 401;
       response.body = JSON.stringify({
         message: 'empId not found',
         errorMsg: e.message,
         errorStack: e.stack,
       }); 
    } else {
      console.error(e);
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: 'Failed to delete post.',
        errorMsg: e.message,
        errorStack: e.stack,
      });
    }
  }
  return response;
};

const deleteEmployee = async (event) => {
  const response = { statusCode: 200 };
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ empId: event.pathParameters.empId }),
    };
    const deleteResult = await client.send(new DeleteItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully deleted post.',
      deleteResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to delete post.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

module.exports = {
  softDeleteEmployee,
  deleteEmployee
};