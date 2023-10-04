const { expect } = require('chai');
const { deleteEmployee, softDeleteEmployee } = require('./api');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

// Mock DynamoDBClient to avoid making actual AWS calls
const mockClient = {
  send: () => ({
    Attributes: {},
    ConsumedCapacity: {}, // Add this field to match the expected format
    options: {
    },
  }),
};

// Mock event object
const event = {
  pathParameters: {
    empId: '102',
  },
};

describe('deleteEmployeeBankInfo', () => {
  let originalDynamoDBClient;

  before(() => {
    // Store the original DynamoDBClient and replace it with the mock
    originalDynamoDBClient = DynamoDBClient;
    DynamoDBClient.prototype.send = () => mockClient.send();
  });

  after(() => {
    // Restore the original DynamoDBClient after tests
    DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
  });

  it('should delete employee bank info successfully', async () => {
    const response = await deleteEmployee(event);

    expect(response.statusCode).to.equal(200);

    const responseBody = JSON.parse(response.body);
    console.log('responseBody.updateResult', responseBody);
    expect(responseBody.message).to.equal('Successfully deleted post.');
    expect(responseBody.deleteResult.Attributes).to.deep.equal({});
  });

  // it('should handle errors gracefully', async () => {
  //   // Mock an error by changing the DynamoDBClient behavior
  //   DynamoDBClient.prototype.send = () => {
  //     throw new Error('Some error occurred.');
  //   };

  //   const response = await softDeleteEmployee(event);

  //   expect(response.statusCode).to.equal(500);

  //   const responseBody = JSON.parse(response.body);
  //   expect(responseBody.message).to.equal(
  //     'Failed to delete employeeId bank Details.'
  //   );
  //   expect(responseBody.errorMsg).to.equal('Some error occurred.');
  //   expect(responseBody.errorStack).to.exist;
  // });
});
