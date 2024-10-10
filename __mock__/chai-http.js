// const sinon = require("sinon");
// const chai = require("chai");
// const chaiHttp = require("chai-http");
// const app = require("../connection");
// chai.use(chaiHttp);

// const mockResponse = {
//   status: 200,
//   body: { message: "Success" },
// };

// class MockChaiHttp {
//   constructor() {
//     this.request = sinon.stub().returns(this);
//     this.get = sinon.stub().resolves(mockResponse);
//     this.post = sinon.stub().returns(this);
//     this.put = sinon.stub().resolves(mockResponse);
//     this.delete = sinon.stub().resolves(mockResponse);
//     this.send = sinon.stub().resolves(mockResponse);
//   }
// }

// const chaiHttpMock = new MockChaiHttp();

// sinon.stub(chai, "request").callsFake(() => chaiHttpMock);

// module.exports = {
//   chaiHttpMock,
//   mockResponse,
// };
const sinon = require("sinon");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../connection");
chai.use(chaiHttp);

const mockResponses = {
  getHealthz: {
    status: 200,
    body: { message: "Health check OK" },
  },
  getUserSelf: {
    status: 200,
    body: {
      id: 1,
      first_name: "Shubham",
      last_name: "Lakhotia",
      email: "shubham@example.com",
    },
  },
  postUser: {
    status: 201,
    body: { id: 1, message: "User created successfully" },
  },
  methodNotAllowed: {
    status: 405,
    body: { error: "Method Not Allowed" },
  },
};

class MockChaiHttp {
  constructor() {
    this.request = sinon.stub().returns(this);

    this.get = sinon.stub().callsFake((url) => {
      if (url === "/healthz") {
        return Promise.resolve(mockResponses.getHealthz);
      } else if (url === "/v1/user/self") {
        return Promise.resolve(mockResponses.getUserSelf);
      }
      return Promise.resolve(mockResponses.methodNotAllowed);
    });

    this.post = sinon.stub().returns(this);

    this.put = sinon.stub().resolves(mockResponses.methodNotAllowed);
    this.delete = sinon.stub().resolves(mockResponses.methodNotAllowed);
    this.send = sinon
      .stub()
      .callsFake(() => Promise.resolve(mockResponses.postUser));
  }
}

const chaiHttpMock = new MockChaiHttp();

sinon.stub(chai, "request").callsFake(() => chaiHttpMock);

module.exports = {
  chaiHttpMock,
  mockResponses,
};
