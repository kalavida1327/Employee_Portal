// Importing necessary modules from the AWS SDK for DynamoDB
const {
  DynamoDBClient,
  DeleteItemCommand,
  UpdateItemCommand,
} = require('@aws-sdk/client-dynamodb');

// Importing the marshall function from the utility library for DynamoDB
const { marshall } = require('@aws-sdk/util-dynamodb');

// Creating an instance of DynamoDBClient
const client = new DynamoDBClient();

const handleDeleteOperation = async (event) => {
  const response = { statusCode: 200 };
    const empId = event.pathParameters.empId;
  try {
    const empId = event.pathParameters.empId;
    
    const endpoint = event.path;

    switch (endpoint) {
      case `/employees/${empId}`:
        const deleteParams = {
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Key: marshall({ empId: empId }),
          ConditionExpression: 'attribute_exists(empId)',
        };
        const deleteResult = await client.send(
          new DeleteItemCommand(deleteParams)
        );
        response.body = JSON.stringify({
          message: 'Successfully deleted employee.',
          deleteResult,
        });
        break;

      case `/PATCH/employees/${empId}`:
        // Handle PATCH operation (Soft Delete)
        const updateExpression = 'SET PersonalInfo.isActive = :isActive';
        const expressionAttributeValues = marshall({
          ':isActive': false,
        });
        const updateParams = {
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Key: marshall({ empId: empId }),
          UpdateExpression: updateExpression,
          ExpressionAttributeValues: expressionAttributeValues,
          ConditionExpression: 'attribute_exists(empId)',
        };
        const updateResult = await client.send(
          new UpdateItemCommand(updateParams)
        );

        response.body = JSON.stringify({
          message: 'Employee deleted successfully.',
          updateResult,
        });
        break;

      default:
        response.statusCode = 400; // Bad Request
        response.body = JSON.stringify({
          message: 'Invalid endpoint.',
        });
    }
  } catch (e) {
    console.error(e);
    response.statusCode = e.statusCode || 500;
    const metadata = e.$metadata || {};
    response.body = JSON.stringify({
      statusCode: metadata.httpStatusCode || response.statusCode,
      message: `Failed to process${empId} employee operation.`,
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

module.exports = {
  handleDeleteOperation,
};