const { expect } = require('chai');
const { handleDeleteOperation } = require('./api');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

// Creating Mock DynamoDBClient to avoid making actual AWS calls
const mockClient = {
  send: () => ({
    Item: {},
  }),
};

// Creating Mock event object
const event = {
  pathParameters: {
    empId: '102',
  },
};

describe('deleteEmployeeBankInfo', () => {
  let originalDynamoDBClient;

  beforeEach(() => {
    // Store the original DynamoDBClient and replace it with the mock
    originalDynamoDBClient = DynamoDBClient;
    DynamoDBClient.prototype.send = () => mockClient.send();
  });

  afterEach(() => {
    // Restore the original DynamoDBClient after tests
    DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
  });

  it('Should handle the DELETE operation successfully', async () => {
    const response = await handleDeleteOperation({
      ...event,
      path: `/employees/${event.pathParameters.empId}`,
    });

    expect(response.statusCode).to.equal(200);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).to.equal('Successfully deleted employee.');
  });

  it('Should handle the PATCH operation successfully', async () => {
    const response = await handleDeleteOperation({
      ...event,
      path: `/PATCH/employees/${event.pathParameters.empId}`,
    });

    expect(response.statusCode).to.equal(200);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).to.equal('Employee deleted successfully.');
  });

  it('Should handle invalid endpoint gracefully', async () => {
    const response = await handleDeleteOperation({
      ...event,
      path: '/invalid/endpoint',
    });

    expect(response.statusCode).to.equal(400);
    const responseBody = JSON.parse(response.body); 
    expect(responseBody.message).to.equal('Invalid endpoint.');
  });

  it('Should handle not found scenario gracefully', async () => {
    // Assuming that the mockClient is set up to return an empty object (no existingItem)
    const response = await handleDeleteOperation({
      ...event,
      path: `/employees/${event.pathParameters.empId}`,
    });

    expect(response.statusCode).to.equal(404);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).to.equal(
      `Employee Id ${event.pathParameters.empId} not found for deletion.`
    );
  });

  it('Should handle errors gracefully during DELETE operation', async () => {
    // Mock an error by changing the DynamoDBClient behavior
    DynamoDBClient.prototype.send = () => {
      throw new Error('Some error occurred.');
    };

    const response = await handleDeleteOperation({
      ...event,
      path: `/employees/${event.pathParameters.empId}`,
    });

    expect(response.statusCode).to.equal(500);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).to.equal(
      `Failed to process${event.pathParameters.empId} employee operation.`
    );
    expect(responseBody.errorMsg).to.equal('Some error occurred.');
    expect(responseBody.errorStack).to.exist;
  });

  it('Should handle errors gracefully during PATCH operation', async () => {
    // Mock an error by changing the DynamoDBClient behavior
    DynamoDBClient.prototype.send = () => {
      throw new Error('Some error occurred.');
    };

    const response = await handleDeleteOperation({
      ...event,
      path: `/PATCH/employees/${event.pathParameters.empId}`,
    });

    expect(response.statusCode).to.equal(500);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).to.equal(
      'Failed to process102 employee operation.'
    );
    expect(responseBody.errorMsg).to.equal('Some error occurred.');
    expect(responseBody.errorStack).to.exist;
  });
});
