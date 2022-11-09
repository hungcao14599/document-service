var express = require("express");
var router = express.Router();
let registerService = require("../services/registerPdf");

router.post("/register", (req, res) => {
  const pdf = req.files.pdf;
  const json = req.files.json;
  const nameHeader = req.fields.nameHeader;
  const nameInstruction = req.fields.nameInstruction;
  const did = req.headers["x-cntrl-did"];

  registerService
    .registerPdf(pdf, json, nameHeader, nameInstruction, did)
    .then((data) => {
      if (data.statusCode === 200) {
        return res.status(200).json({
          success: true,
          message: "Registered pdf",
          data: {
            fileContent: data.data,
          },
        });
      } else if (data.statusCode === 401) {
        return res
          .status(401)
          .json({ success: false, message: "Missing Authorization" });
      }
      // else if (data.message) {
      //   return res
      //     .status(200)
      //     .json({ success: false, message: "Document already exists" });
      // }
      else {
        return res.status(400).json({
          success: false,
          message: "Something went wrong. Please try again",
        });
      }
    });
  //   }
  //   else {
  //     registerService
  //       .register(fileData, token, hash, ext, user)
  //       //calls python service
  //       .then((data) => {
  //         if (data.status) {
  //           console.log({
  //             success: true,
  //             message: "Registered file",
  //             data: {
  //               /*fileContent: data.fileContent,*/ hash: hash,
  //               vddStructure: data.response,
  //             },
  //           });
  //           return res.status(200).json({
  //             success: true,
  //             message: "Registered file",
  //             data: { hash: hash, vddStructure: data.response },
  //           });
  //         } else if (data.message) {
  //           return res
  //             .status(200)
  //             .json({ success: false, message: "Document already exists" });
  //         } else {
  //           return res.status(400).json({
  //             success: false,
  //             message: "Something went wrong. Please try again",
  //           });
  //         }
  //       });
  //   }
});

module.exports = router;
