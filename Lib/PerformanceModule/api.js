// Importing necessary modules from the AWS SDK for DynamoDB
const {
  DynamoDBClient,
  UpdateItemCommand,
  PutItemCommand,
} = require('@aws-sdk/client-dynamodb');

// Importing the marshall function from the utility library for DynamoDB
const { marshall } = require('@aws-sdk/util-dynamodb');

// Creating an instance of DynamoDBClient
const client = new DynamoDBClient();

const performanceHandler = async (event) => {
  const response = { statusCode: 200 };
  const empId = event.pathParameters.empId;
  try {
    const endpoint = event.path;
    const PerformanceInfo = event?.body?.empId;
    const body = event.body;

    // Log the entire event for better understanding
    console.log('-------------event----------', JSON.stringify(event, null, 2));

    // Ensure that event.body is defined
    if (!body) {
      throw new Error('Request body is undefined');
    }


    // Check if PerformanceInfo is undefined or null
    if (!PerformanceInfo) {
      throw new Error('PerformanceInfo is undefined or null');
    }

    console.log('-------------PerformanceInfo----------', PerformanceInfo);
    console.log('body', body);

    switch (endpoint) {
      case `/performance/create/${empId}`:
        const params = {
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Key: marshall(
            {
              empId: body?.empId,
              PerformanceInfo: {
                Comments: PerformanceInfo?.Comments,
                Description: PerformanceInfo?.Description,
                StartDate: PerformanceInfo?.StartDate,
                EndDate: PerformanceInfo?.EndDate,
                IsActive: PerformanceInfo?.IsActive,
                RatingAwarded: PerformanceInfo?.RatingAwarded,
                RatingClaimed: PerformanceInfo?.RatingClaimed,
              },
            },
            { removeUndefinedValues: true }
          ),
        };
        const CreatePerformance = await client.send(new PutItemCommand(params));
        response.body = JSON.stringify({
          message: 'Successfully created employee performance details.',
          CreatePerformance,
        });
        break;

      case `/performance/update/${empId}`:
        const {
          Description,
          StartDate,
          EndDate,
          RatingClaimed,
          RatingAwarded,
          Comments,
          IsActive,
        } = event.pathParameters.PreformanceInfo;
        // Handle PATCH operation (Soft Delete)
        const updateExpression =
          'SET PerformanceInfo.Description = :Description, ' +
          'PerformanceInfo.StartDate = :StartDate, ' +
          'PerformanceInfo.EndDate = :EndDate, ' +
          'PerformanceInfo.RatingClaimed = :RatingClaimed, ' +
          'PerformanceInfo.RatingAwarded = :RatingAwarded, ' +
          'PerformanceInfo.Comments = :Comments, ' +
          'PerformanceInfo.IsActive = :IsActive';

        const expressionAttributeValues = marshall({
          ':Description': Description,
          ':StartDate': StartDate,
          ':EndDate': EndDate,
          ':RatingClaimed': RatingClaimed,
          ':RatingAwarded': RatingAwarded,
          ':Comments': Comments,
          ':IsActive': IsActive,
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
  performanceHandler,
};
