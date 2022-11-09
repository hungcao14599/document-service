import QRCode from "qrcode";
const fs = require("fs-extra");
const { v4: uuidv4 } = require("uuid");
var moment = require("moment");
var FileReader = require("filereader");
import { PDFDocument, rgb } from "pdf-lib";

let service = {};

//it should be refactor because  it's duplicated on the document-service.
service.registerPdf = (pdf, json, nameHeader, nameInstruction, did) => {
  const addHeader = true;
  const addInstructions = true;
  return new Promise(async (resolve, reject) => {
    if (
      pdf === undefined ||
      json === undefined ||
      nameHeader === undefined ||
      nameInstruction === undefined
    ) {
      resolve({ statusCode: 400, success: false });
    } else if (did === undefined) {
      resolve({ statusCode: 401, success: false });
    } else {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const byteArray = new Uint8Array(arrayBuffer);
        const tempBuffer = [];
        for (let i = 0; i < byteArray.length; i++) {
          tempBuffer.push(byteArray[i]);
        }

        let pdfBytes;
        let docId = uuidv4();
        let pdfDoc = await PDFDocument.load(byteArray);
        pdfDoc.addPage();

        // end
        let publicName = "Public Name not Available";
        if (addHeader) {
          const pages = pdfDoc.getPages();
          let url = await QRCode.toDataURL(
            `https://dev.trucopy.io/verify/${docId}`
          );
          let base64Data = url.replace(/^data:image\/png;base64,/, "");
          let binaryData = Buffer.from(base64Data, "base64");

          const jpgImage = await pdfDoc.embedPng(binaryData);

          const logoImage = await pdfDoc.embedPng(
            fs.readFileSync(
              process.cwd() + "/src/assets/img/logo-pdf-new-1.png"
            )
          );
          const qrLogoImage = await pdfDoc.embedPng(
            fs.readFileSync(process.cwd() + "/src/assets/img/logo-new.png")
          );
          const date = moment(new Date()).format("MMMM DD,YYYY");

          const logoDims = logoImage.scale(0.09);
          const qrLogoDims = qrLogoImage.scale(0.04);
          const jpgDims = jpgImage.scale(0.4);

          let pageLength;
          if (addInstructions) {
            pageLength = pages.length - 1;
          } else {
            pageLength = pages.length;
          }
          for (let i = 0; i < pageLength; i++) {
            pages[i].setSize(595, 842);
            pages[i].drawText("REGISTERED BY:", {
              x: 175,
              y: 820,
              size: 5,
              color: rgb(0.45, 0.45, 0.45),
            });
            pages[i].drawText(`${publicName}`, {
              x: 175,
              y: 805,
              size: 9,
              color: rgb(0.1, 0.1, 0.1),
            });
            pages[i].drawText(did, {
              x: 175,
              y: 795,
              size: 6,
              color: rgb(0.1, 0.1, 0.1),
            });
            pages[i].drawText("DATE:", {
              x: 325,
              y: 820,
              size: 5,
              color: rgb(0.45, 0.45, 0.45),
            });
            pages[i].drawText(`${date}`, {
              x: 325,
              y: 795,
              size: 9,
              color: rgb(0.1, 0.1, 0.1),
            });
            pages[i].drawImage(jpgImage, {
              x: 520,
              y: 768,
              width: jpgDims.width,
              height: jpgDims.height,
            });
            pages[i].drawImage(qrLogoImage, {
              x: 542,
              y: 793,
              width: qrLogoDims.width * 1.2,
              height: qrLogoDims.height * 1.2,
            });
            pages[i].drawText(nameHeader, {
              x: 25,
              y: 800,
              size: 20,
              color: rgb(0.1, 0.1, 0.1),
            });
            pages[i].drawLine({
              start: { x: 305, y: 830 },
              end: { x: 305, y: 790 },
              opacity: 0.5,
              color: rgb(0.45, 0.45, 0.45),
            });
            pages[i].drawLine({
              start: { x: 155, y: 830 },
              end: { x: 155, y: 790 },
              opacity: 0.5,
              color: rgb(0.45, 0.45, 0.45),
            });
          }
          pdfBytes = await pdfDoc.save();

          let pagesT = pdfDoc.getPages();

          // width, height 595.28 841.89
          const width = 595.28;
          const height = 841.89;

          pagesT[pagesT.length - 1].drawLine({
            start: { x: width / 3, y: height - 40 },
            end: { x: (2 * width) / 3, y: height - 40 },
            opacity: 0.5,
            color: rgb(0.45, 0.45, 0.45),
          });

          pagesT[pagesT.length - 1].drawText(nameInstruction, {
            x: width / 2 - 60,
            y: height - 70,
            size: 20,
            color: rgb(0.0, 0.0, 0.0),
          });

          pagesT[pagesT.length - 1].drawLine({
            start: { x: width / 3, y: height - 110 },
            end: { x: (2 * width) / 3, y: height - 110 },
            opacity: 0.5,
            color: rgb(0.0, 0.0, 0.0),
          });

          pagesT[pagesT.length - 1].drawText("Digital True Copy File", {
            x: 40,
            y: height - 140,
            size: 15,
            color: rgb(0.0, 0.0, 0.0),
          });
          pagesT[pagesT.length - 1].drawText(
            `This is a verifiable digital document that is a true copy of a file \n` +
              `registered at TruCopy Docs`,
            {
              x: 40,
              y: height - 170,
              size: 13,
              color: rgb(0.0, 0.0, 0.0),
            }
          );
          pagesT[pagesT.length - 1].drawText("Registration Details", {
            x: 40,
            y: height - 220,
            size: 15,
            color: rgb(0.0, 0.0, 0.0),
          });
          pagesT[pagesT.length - 1].drawText("Reg'd filename: ", {
            x: 50,
            y: height - 240,
            size: 13,
            color: rgb(0.0, 0.0, 0.0),
          });
          pagesT[pagesT.length - 1].drawText(`${pdf.name}`, {
            x: 160,
            y: height - 240,
            size: 13,
            color: rgb(0.0, 0.0, 0.0),
          });

          pagesT[pagesT.length - 1].drawText("Reg'd on: ", {
            x: 50,
            y: height - 260,
            size: 13,
            color: rgb(0.0, 0.0, 0.0),
          });
          pagesT[pagesT.length - 1].drawText(`${date}`, {
            x: 160,
            y: height - 260,
            size: 13,
            color: rgb(0.0, 0.0, 0.0),
          });

          pagesT[pagesT.length - 1].drawText("Reg'd by: ", {
            x: 50,
            y: height - 280,
            size: 13,
            color: rgb(0.0, 0.0, 0.0),
          });
          pagesT[pagesT.length - 1].drawText(did, {
            x: 160,
            y: height - 280,
            size: 13,
            color: rgb(0.0, 0.0, 0.0),
          });

          pagesT[pagesT.length - 1].drawText("Verification Instructions", {
            x: 50,
            y: height - 370,
            size: 20,
            color: rgb(0.0, 0.0, 0.0),
          });
          pagesT[pagesT.length - 1].drawText("This file can be verified here", {
            x: 50,
            y: height - 410,
            size: 15,
            color: rgb(0.0, 0.0, 0.0),
          });
          pagesT[pagesT.length - 1].drawText(
            `Scan the QR code on the right to \n` +
              `visit our TruCopy Docs Verification Page \n`,
            {
              x: 50,
              y: height - 430,
              size: 13,
              color: rgb(0.0, 0.0, 0.0),
            }
          );

          pagesT[pagesT.length - 1].drawImage(jpgImage, {
            x: width / 2,
            y: height / 2.5 - 50,
            width: jpgDims.width * 3,
            height: jpgDims.height * 3,
          });
          pagesT[pagesT.length - 1].drawImage(qrLogoImage, {
            x: (2 * width) / 3 - 20,
            y: height / 2 - 50,
            width: qrLogoDims.width * 2.5,
            height: qrLogoDims.height * 2.5,
          });

          pagesT[pagesT.length - 1].drawImage(logoImage, {
            x: 470,
            y: 30,
            width: logoDims.width,
            height: logoDims.height,
          });

          pdfBytes = await pdfDoc.save();
        }

        pdfBytes = await pdfDoc.save();

        const readerJson = new FileReader();

        readerJson.onload = async (e) => {
          const arrayBuffer = e.target.result;
          const tempBuffer = new Uint8Array(arrayBuffer);
          await pdfDoc.attach(tempBuffer, json.name, {
            mimeType: "application/json",
            description: "Attached json",
            creationDate: new Date(),
            modificationDate: new Date(),
          });
          pdfBytes = await pdfDoc.save();

          var binary = "";
          var bytes = new Uint8Array(pdfBytes);
          var len = bytes.byteLength;
          for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const pdfBytesBase64 = btoa(binary);
          resolve({ statusCode: 200, success: true, data: pdfBytesBase64 });
        };
        readerJson.readAsArrayBuffer(json);
      };
      reader.readAsArrayBuffer(pdf);
    }
  });
};

module.exports = service;
