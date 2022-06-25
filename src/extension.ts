// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import axios from 'axios';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Console } from 'console';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	console.log('Congratulations, your extension "mrsc" is now active!');

	const disposable = vscode.commands.registerCommand('mrsc.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from mrsc!');
	});

	const disposable1 = vscode.commands.registerCommand('mrsc.pull_strapi', () => {
		vscode.window.showInformationMessage('pull from Strapi');	
	});
	
	const disposable2 = vscode.commands.registerCommand('mrsc.publish_strapi', () => {
		vscode.window.showInformationMessage('publish on Strapi');
	});

	// eslint-disable-next-line @typescript-eslint/naming-convention
	function PullJsonInFile(path:string, filename:string, data: string){
		if (fs.existsSync(path + filename)) {
			console.log(`A file with that name ${path + filename} already exists`);
		} else {
			fs.writeFile(path + filename, data, function(err){
				if(err){
					vscode.window.showInformationMessage('It is not possible to save the file in this path');
				}
			});					
		}		
	}

	const disposable3 = vscode.commands.registerCommand('mrsc.pull_json',  () => {	
		const path = require('path');
        const request = require("request");
		var urlForRequest = '';
		var filePathForSave = '';
		var authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjU2MDA2NjkxLCJleHAiOjE2NTg1OTg2OTF9.91s4PbON0asQRw5GvX7L6acdiD4VXg7xJtjK865RW9Y';
		var hostPath = 'http://localhost:1337/';		
        var collectionTypes = ['form', 'hook', 'calendar-event'];
		var data: any;
		filePathForSave = path.join(__dirname, '../');
		collectionTypes.forEach(function(collectrionType: any){
			request({
				url: hostPath + 'content-manager/explorer/application::' + collectrionType + '.' + collectrionType,
				headers: {
					   // eslint-disable-next-line @typescript-eslint/naming-convention
					   'Authorization': 'Bearer ' + authToken
				},
				rejectUnauthorized: false
			}, function(err: any, res: { body: any; }) {
				if(err) {
					console.error(err);
				} else {
					data = JSON.parse(res.body);
					if(data.length !== 0){
						if (!fs.existsSync(filePathForSave + 'src/' + collectrionType + 's')){
							fs.mkdirSync(filePathForSave + 'src/' + collectrionType + 's');
						}
						data.forEach(function(item: any) {	
							request({
								url: hostPath + collectrionType + 's/' + item.id,
								headers: {
									// eslint-disable-next-line @typescript-eslint/naming-convention
									'Authorization': 'Bearer ' + authToken
								},
								rejectUnauthorized: false
							}, function(err: any, res: { body: any; }) {
								if(err) {
									console.error(err);
								} else {
									PullJsonInFile(filePathForSave + "src/" + collectrionType + 's/', item.id + ".json", JSON.stringify(JSON.parse(res.body), null, '\t'));
								}		  
							});
						});
					}
				}		  
			});
		});
	});
	context.subscriptions.push(disposable, disposable1, disposable2, disposable3);
}




// this method is called when your extension is deactivated
export function deactivate() {}
function callback(result: any) {
	throw new Error('Function not implemented.');
}

