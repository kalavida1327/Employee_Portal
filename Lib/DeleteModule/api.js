const {
  DynamoDBClient,
  DeleteItemCommand,
  UpdateItemCommand,
  ConditionalCheckFailedException,
} = require('@aws-sdk/client-dynamodb');

const { marshall} = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient();

const softDeleteEmployee = async (event) => {
   const response = { statusCode: 200 };
   try {
     const empId = event.pathParameters.empId;

     // Define the update expression to set isActive to true
     const updateExpression = 'SET isActive = :isActive';

     // Define the expression attribute values
     const expressionAttributeValues = marshall({
       ':isActive': true,
     });

     const params = {
       TableName: process.env.DYNAMODB_TABLE_NAME,
       Key: marshall({ empId: empId }),
       UpdateExpression: updateExpression,
       ExpressionAttributeValues: expressionAttributeValues,
     };

     const updateResult = await client.send(new UpdateItemCommand(params));

     response.body = JSON.stringify({
       message: 'Employee activated successfully.',
       updateResult,
     });
   } catch (e) {
     console.error(e);
     response.statusCode = 500;
     response.body = JSON.stringify({
       message: 'Failed to activate employee.',
       errorMsg: e.message,
       errorStack: e.stack,
     });
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