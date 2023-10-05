const {
  DynamoDBClient,
  DeleteItemCommand,
  UpdateItemCommand,
  GetItemCommand,
} = require('@aws-sdk/client-dynamodb');

const { marshall } = require('@aws-sdk/util-dynamodb');

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
      message: 'Employee deleted successfully.',
      updateResult,
    });
  } catch (e) {
    console.error(e);
    response.body = JSON.stringify({
      message: 'Failed to deleted employee.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

const deleteEmployee = async (event) => {
  const response = { statusCode: 200 };
  const empId = event.pathParameters.empId;
  try {
    const getItemParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ emId: empId }),
    };
    const existingItem = await client.send(new GetItemCommand(getItemParams));

    // If the item does not exist, return a failure response
    if (!existingItem.Item) {
      response.statusCode = 404; // Not Found
      response.body = JSON.stringify({
        message: 'Employee not found for deletion.',
      });
      return response;
    }
    // If the item exists, proceed with the delete operation
    const deleteParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ empId: empId }),
    };

    const deleteResult = await client.send(new DeleteItemCommand(deleteParams));

    response.body = JSON.stringify({
      message: 'Successfully deleted employee.',
      deleteResult,
    });
  } catch (e) {
    console.log('---------error', e);
    console.error(e);
    response.statusCode = e.statusCode;
    response.body = JSON.stringify({
      message: 'Failed to delete employee personal information.',
      errorMsg: e.message,
      errorStack: e.stack,
      statusCode: e.httpStatusCode,
    });
  }
  return response;
};

module.exports = {
  softDeleteEmployee,
  deleteEmployee,
};
