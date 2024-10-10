const sinon = require("sinon");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../connection"); // Your app's main entry point

chai.use(chaiHttp);

const mockResponse = {
  status: 200,
  body: { message: "Success" },
};

// Mocking HTTP calls using Sinon
class MockChaiHttp {
  constructor() {
    this.request = sinon.stub().returns(this);
    this.get = sinon.stub().resolves(mockResponse);
    this.post = sinon.stub().returns(this); // Return `this` to chain .send()
    this.put = sinon.stub().resolves(mockResponse);
    this.delete = sinon.stub().resolves(mockResponse);
    this.send = sinon.stub().resolves(mockResponse); // Add send to chain with post()
  }
}

const chaiHttpMock = new MockChaiHttp();

// Mocking chai-http request with sinon
sinon.stub(chai, "request").callsFake(() => chaiHttpMock);

module.exports = {
  chaiHttpMock,
  mockResponse,
};
