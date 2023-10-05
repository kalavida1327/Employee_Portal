const { expect } = require('chai');
const { deleteEmployee, softDeleteEmployee } = require('./api');
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
    empId: '101',
  },
};

describe('deleteEmployeeBankInfo', () => {
  let originalDynamoDBClient;

  beforeEach(async () => {
    // Store the original DynamoDBClient and replace it with the mock
    originalDynamoDBClient = DynamoDBClient;
    DynamoDBClient.prototype.send = () => mockClient.send();
  });

  afterEach(() => {
    // Restore the original DynamoDBClient after tests
    DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
  });

  it('Should delete employee personal info successfully', async () => {
    const response = await deleteEmployee(event);
    expect(response.statusCode).to.equal(200);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).to.equal('Successfully deleted employee.');
  });

  it('Delete function should handle the errors gracefully', async () => {
    // Mock an error by changing the DynamoDBClient behavior
    DynamoDBClient.prototype.send = () => {
      throw new Error('Some error occurred.');
    };
    const response = await deleteEmployee(event);
    expect(response.statusCode).to.equal(500);

    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).to.equal(
      'Failed to delete employee personal information.'
    );
    expect(responseBody.errorMsg).to.equal('Some error occurred.');
    expect(responseBody.errorStack).to.exist;
  });

  it('should softdelete employee personal info successfully', async () => {
    const response = await softDeleteEmployee(event);
    expect(response.statusCode).to.equal(200);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).to.equal('Employee deleted successfully.');
  });

  it('softDelete function should handle the errors gracefully', async () => {
    // Mock an error by changing the DynamoDBClient behavior
    DynamoDBClient.prototype.send = () => {
      throw new Error('Some error occurred.');
    };
    const response = await softDeleteEmployee(event);
    expect(response.statusCode).to.equal(500);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).to.equal('Failed to deleted employee.');
    expect(responseBody.errorMsg).to.equal('Some error occurred.');
    expect(responseBody.errorStack).to.exist;
  });
});
