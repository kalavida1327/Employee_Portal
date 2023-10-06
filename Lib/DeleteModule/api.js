// Importing necessary modules from the AWS SDK for DynamoDB
const {
  DynamoDBClient,
  DeleteItemCommand,
  UpdateItemCommand,
  GetItemCommand,
} = require('@aws-sdk/client-dynamodb');

// Importing the marshall function from the utility library for DynamoDB
const { marshall } = require('@aws-sdk/util-dynamodb');

// Creating an instance of DynamoDBClient
const client = new DynamoDBClient();

// Function to perform a soft delete on an employee by updating the 'isActive' attribute
const softDeleteEmployee = async (event) => {
  const response = { statusCode: 200 };
  try {
    // Extracting employee ID from the path parameters in the event
    const empId = event.pathParameters.empId;

    // Defining the update expression to set isActive to true
    const updateExpression = 'SET isActive = :isActive';

    // Defining the expression attribute values
    const expressionAttributeValues = marshall({
      ':isActive': true,
    });

    // Constructing parameters for the UpdateItemCommand
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ empId: empId }),
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    // Sending the UpdateItemCommand to DynamoDB and capturing the result
    const updateResult = await client.send(new UpdateItemCommand(params));

    // Building the response body
    response.body = JSON.stringify({
      message: 'Employee deleted successfully.',
      updateResult,
    });
  } catch (e) {
    // Handling errors and constructing an error response
    console.error(e);
    response.body = JSON.stringify({
      statusCode: e.$metadata.httpStatusCode,
      message: 'Failed to delete employee.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

// Function to delete an employee's information from DynamoDB
const deleteEmployee = async (event) => {
  const response = { statusCode: 200 };
  const empId = event.pathParameters.empId;
  try {
    // Constructing parameters for the GetItemCommand to check if the employee exists
    const getItemParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ empId: empId }),
    };

    // Sending the GetItemCommand to DynamoDB and capturing the existing item
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

    // Sending the DeleteItemCommand to DynamoDB and capturing the result
    const deleteResult = await client.send(new DeleteItemCommand(deleteParams));

    // Building the response body
    response.body = JSON.stringify({
      message: 'Successfully deleted employee.',
      deleteResult,
    });
  } catch (e) {
    // Handling errors and constructing an error response
    console.error(e);
    response.statusCode = e.statusCode;
    response.body = JSON.stringify({
      statusCode: e.$metadata.httpStatusCode,
      message: 'Failed to delete employee personal information.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

// Exporting the functions for external use
module.exports = {
  softDeleteEmployee,
  deleteEmployee,
};
