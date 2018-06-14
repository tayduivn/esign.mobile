export function iconSelection(files, length) {
	let img = [];
	for (let i = 0; i < length; i++) { // какое расширение у файлов
		switch (files[i].extension) {
			case "avi":
				img[i] = require("../../imgs/general/file_avi.png"); break;
			case "doc":
				img[i] = require("../../imgs/general/file_doc.png"); break;
			case "docx":
				img[i] = require("../../imgs/general/file_docx.png"); break;
			case "enc":
				img[i] = require("../../imgs/general/file_enc.png"); break;
			case "jpg":
				img[i] = require("../../imgs/general/file_jpg.png"); break;
			case "pdf":
				img[i] = require("../../imgs/general/file_pdf.png"); break;
			case "ppt":
				img[i] = require("../../imgs/general/file_ppt.png"); break;
			case "sig":
				img[i] = require("../../imgs/general/file_sig.png"); break;
			case "txt":
				img[i] = require("../../imgs/general/file_txt.png"); break;
			case "xls":
				img[i] = require("../../imgs/general/file_xls.png"); break;
			case "zip":
				img[i] = require("../../imgs/general/file_zip.png"); break;
			default:
				img[i] = require("../../imgs/general/file_unknown.png"); break;
		}
	}
	return img;
}