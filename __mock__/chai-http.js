const sinon = require("sinon");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../connection");
chai.use(chaiHttp);

const mockResponse = {
  status: 200,
  body: { message: "Success" },
};

class MockChaiHttp {
  constructor() {
    this.request = sinon.stub().returns(this);
    this.get = sinon.stub().resolves(mockResponse);
    this.post = sinon.stub().returns(this);
    this.put = sinon.stub().resolves(mockResponse);
    this.delete = sinon.stub().resolves(mockResponse);
    this.send = sinon.stub().resolves(mockResponse);
  }
}

const chaiHttpMock = new MockChaiHttp();

sinon.stub(chai, "request").callsFake(() => chaiHttpMock);

module.exports = {
  chaiHttpMock,
  mockResponse,
};
