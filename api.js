const {
  DynamoDBClient,
  UpdateItemCommand
} = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient();

const updateEmployee = async (event) => {
  
  const response = { statusCode: 200 };
  try {
    const body = JSON.parse(event.body);
    const objKeys = Object.keys(body);
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({
        empId: event.pathParameters.empId,
      }),
      UpdateExpression: `SET ${objKeys
        .map((_, index) => `#key${index} = :value${index}`)
        .join(', ')}`,
      ExpressionAttributeNames: objKeys.reduce(
        (acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
        }),
        {}
      ),
      ExpressionAttributeValues: marshall(
        objKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`:value${index}`]: body[key],
          }),
          {}
        )
      ),
      ConditionExpression: 'attribute_exists(empId)'
    };
    const updateResult = await client.send(new UpdateItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully updated post.',
      updateResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to update post.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};


module.exports = {
  updateEmployee
};
