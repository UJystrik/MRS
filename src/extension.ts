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

	function Request (url: string, authToken: string, callback: any){
		const request = require("request");
		var result: any;
		request({
			url: url,
			headers: {
			   'Authorization': 'Bearer ' + authToken
			},
			rejectUnauthorized: false
		  }, function(err: any, res: { body: any; }) {
				if(err) {
					console.error(err);
				} else {
					//console.log(res.body)
					callback(res.body);
				}		  
		});
	};
	function callback(res: any){
		console.log(res);
	}

	function PullJsonInFile(path:string, filename:string, data: string){
		if (fs.existsSync(path + filename)) {
			vscode.window.showInformationMessage('A file with that name already exists');
		} else {
			fs.writeFile(path + filename, data, function(err){
				if(err){
					vscode.window.showInformationMessage('It is not possible to save the file in this path');
				}
				else{
					//vscode.window.showInformationMessage('pull json');
				}
			});					
		}		
	}

	const disposable3 = vscode.commands.registerCommand('mrsc.pull_json', async () => {	
		const path = require('path');
        const request = require("request");
		var url = '';
		var authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjU2MDA2NjkxLCJleHAiOjE2NTg1OTg2OTF9.91s4PbON0asQRw5GvX7L6acdiD4VXg7xJtjK865RW9Y';
		var filePathForSave = path.join(__dirname, '../') + "src/forms";
		filePathForSave = filePathForSave + "/";		
        var collectionTypes = ['form', 'hook'];
		collectionTypes.forEach(async function(collectrionType: any){
			var { data } = await axios.get('http://localhost:1337/content-manager/explorer/application::' + collectrionType + '.' + collectrionType, {
  				headers: {
    				Authorization: 'Bearer ' + authToken,
  				},
		    });
			await Promise.all(data);
			//console.log(data);
			if(data.length !== 0){
				filePathForSave = path.join(__dirname, '../') + "src/" + collectrionType + 's';
				if (!fs.existsSync(filePathForSave)){
					fs.mkdirSync(filePathForSave);
				}
				filePathForSave = filePathForSave + "/";
			}
			data.forEach(function(item: any, i: any, data: any) {	
				url = 'http://localhost:1337/'+ collectrionType + 's/' + item.id;	
				request({
					url: url,
					headers: {
			   			'Authorization': 'Bearer ' + authToken
					},
					rejectUnauthorized: false
		  		}, function(err: any, res: { body: any; }) {
					if(err) {
						console.error(err);
					} else {
						console.log(res.body);
						PullJsonInFile(filePathForSave, item.id + ".json", res.body);
					}		  
				});
			});
		});
		/*collectionTypes.forEach(async function(collectrionType) {
			var { data } = await axios.get('http://localhost:1337/content-manager/explorer/application::' + collectrionType + '.' + collectrionType, {
  				headers: {
    				Authorization: 'Bearer ' + authToken,
  				},
		    });
			//console.log(data);
			if(data.length !== 0){
				filePathForSave = path.join(__dirname, '../') + "src/" + collectrionType + 's';
				if (!fs.existsSync(filePathForSave)){
					fs.mkdirSync(filePathForSave);
				}
				filePathForSave = filePathForSave + "/";
			}
			data.forEach(function(item: any, i: any, data: any) {	
				url = 'http://localhost:1337/'+ collectrionType + 's/' + item.id;	
				request({
					url: url,
					headers: {
			   			'Authorization': 'Bearer ' + authToken
					},
					rejectUnauthorized: false
		  		}, function(err: any, res: { body: any; }) {
					if(err) {
						console.error(err);
					} else {
						console.log(res.body);
						PullJsonInFile(filePathForSave, item.id + ".json", res.body);
					}		  
				});
			});
		});*/
		
	});
	context.subscriptions.push(disposable, disposable1, disposable2, disposable3);
}




// this method is called when your extension is deactivated
export function deactivate() {}
function callback(result: any) {
	throw new Error('Function not implemented.');
}

