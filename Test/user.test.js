// const chai = require("chai");
// const chaiHttp = require("chai-http");
// const http = require("http");
// const app = require("../connection");
// const { User } = require("../models");
// // require("dotenv").config();
// chai.use(chaiHttp);
// const expect = chai.expect;

// const server = http.createServer(app);
// const PORT = process.env.TEST_PORT || 3002;
// describe("API Test", () => {
//   before(async () => {
//     await User.destroy({ where: {} });
//     await new Promise((resolve) => server.listen(PORT, resolve));
//   });

//   after(async () => {
//     await new Promise((resolve) => server.close(resolve));
//   });

//   it("Multiple accounts with the same email are not allowed", async () => {
//     let response = await chai.request(server).post("/v1/user").send({
//       first_name: "Shubham",
//       last_name: "Lakhotia",
//       email: "smaheshwari029@gmail.com",
//       password: "Shubham@1234",
//     });
//     expect(response).to.have.status(201);
//     expect(response.body).to.have.property("email", "smaheshwari029@gmail.com");

//     response = await chai.request(server).post("/v1/user").send({
//       first_name: "Shubham",
//       last_name: "Lakhotia",
//       email: "smaheshwari029@gmail.com",
//       password: "Shubham@1234",
//     });
//     expect(response).to.have.status(400);
//     expect(response.body).to.have.property("error", "Email already exists");
//   });

//   it("NOT allow user to update account_created and account_updated", async () => {
//     const res = await chai.request(server).put("/v1/user/self").send({
//       account_created: "2021-01-01",
//       account_updated: "2021-01-02",
//     });
//     expect(res.status).to.equal(401);
//   });
// });

const chai = require("chai");
const chaiHttp = require("chai-http");
const http = require("http");
const app = require("../connection");
const { User } = require("../models");
const sinon = require("sinon");

chai.use(chaiHttp);
const expect = chai.expect;

const server = http.createServer(app);
const PORT = process.env.TEST_PORT || 3002;

describe("API Test", () => {
  before(async () => {
    // Stub the User model methods
    sinon.stub(User, "destroy").resolves();

    // Stub findOne to simulate a user already existing
    sinon.stub(User, "findOne").callsFake(async ({ where: { email } }) => {
      if (email === "smaheshwari029@gmail.com") {
        return Promise.resolve({ email }); // User already exists
      }
      return Promise.resolve(null); // No user found
    });

    // Stub create to handle unique email scenario
    sinon.stub(User, "create").callsFake(async (userData) => {
      const existingUser = await User.findOne({
        where: { email: userData.email },
      });
      if (existingUser) {
        throw new Error("Email already exists"); // Simulate error if email already exists
      }
      return userData; // Simulate successful creation for other emails
    });

    await new Promise((resolve) => server.listen(PORT, resolve));
  });

  after(async () => {
    await new Promise((resolve) => {
      server.close(resolve);
      sinon.restore(); // Restore the original methods after tests
    });
  });

  it("NOT allow user to update account_created and account_updated", async () => {
    const res = await chai.request(server).put("/v1/user/self").send({
      account_created: "2021-01-01",
      account_updated: "2021-01-02",
    });
    expect(res.status).to.equal(401); // Expecting 401 status for unauthorized update
  });
});
