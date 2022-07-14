// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as cheerio from 'cheerio';

const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjU2MDA2NjkxLCJleHAiOjE2NTg1OTg2OTF9.91s4PbON0asQRw5GvX7L6acdiD4VXg7xJtjK865RW9Y';
const hostPath = 'http://localhost:1337/';
const authHead = {Authorization: 'Bearer ' + authToken};
const authorization = authHead.Authorization;

function GetSpecFromString(str: string){
	var pos = str.indexOf('spec:');
	var retStr = '';
	var brackets = 0;
	if(pos === -1){
		return 'error';
	}
	for(pos; pos !== str.length && str[pos] !== '{'; pos++){};
	if(pos === str.length){
		return 'error';
	}
	brackets = 1;
	retStr = retStr + str[pos];
	pos = pos + 1;
	for(pos; pos !== str.length && brackets !== 0; pos++){
		retStr = retStr + str[pos];
		if(str[pos] === '{'){
			brackets = brackets + 1;
		} else if(str[pos] === '}'){
			brackets = brackets - 1;
		}
	};
	return retStr;
}

function IsInJson(json: any, str: string){
	for(var elem in json){
		if(elem === str){
			return true;
		}
	}
	return false;
}

function PullJsonInFile(path: string, filename: string, data: string){
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

function PullInFiles(collectionTypes:any, hostPath: string, authToken: string, filePathForSave: string){
	const request = require("request");
	var data: any;

	if (!fs.existsSync(filePathForSave + 'strapi-data')){
		fs.mkdirSync(filePathForSave + 'strapi-data');
	}
	filePathForSave = filePathForSave + 'strapi-data/';
	collectionTypes.forEach(function(collectrionType: any){
		let urlWithCollectionType = '';
		if(collectrionType === 'tag'){
			urlWithCollectionType = 'application::' + collectrionType + 's.' + collectrionType + 's';
		} else if(collectrionType === 'user'){
			urlWithCollectionType = 'plugins::' + 'users-permissions.user';
		} else {
			urlWithCollectionType = 'application::' + collectrionType + '.' + collectrionType;
		}
		request({
			url: hostPath + 'content-manager/explorer/' + urlWithCollectionType,
			headers: {
				authorization
			},
		}, function(err: any, res: { body: any; }) {
			if(err) {
				console.error(err);
			} else {
				data = JSON.parse(res.body);
				if(data.length !== 0){
					if(collectrionType === 'tags'){
						collectrionType = collectrionType.substring(0, collectrionType.length - 1);
					}
					if (!fs.existsSync(filePathForSave + collectrionType + 's')){
						fs.mkdirSync(filePathForSave + collectrionType + 's');
					}
					data.forEach(function(item: any) {	
						request({
							url: hostPath + collectrionType + 's/' + item.id,
							headers: {
								authorization
							},
							rejectUnauthorized: false
						}, function(err: any, res: { body: any; }) {
							if(err) {
								console.error(err);
							} else {
								PullJsonInFile(filePathForSave + collectrionType + 's/', item.id + '.json', JSON.stringify(JSON.parse(res.body), null, '\t'));
							}		  
						});
					});
				}
			}		  
		});
	});
}

function PublishInStrapi(){
	const path = require('path');
	const request = require("request");
	var filePathForSave = path.join(__dirname, '../') + 'src/strapi-data/';
	const parametersForDelete = ["createdDate", "updatedDate", "published_at"];
	

	fs.readdir(filePathForSave, (err, dirs) => {
  		dirs.forEach(dir => {
			fs.readdir(filePathForSave + dir, (err, files) => {
				files.forEach(file => {
					let elementId = file.split('.')[0];
					let fileContent = JSON.parse(fs.readFileSync(filePathForSave + dir + '/' + file, "utf8"));
					parametersForDelete.forEach(function(parameter: any) {
						delete fileContent[parameter];
					});	
					request.get({
						url: hostPath  + dir + '/' + elementId,
						headers: {
							authorization
						}
					}, function(err: any, res: { body: any; }) {
						if(res.body === 'Not Found'){
							request.post({
								url: hostPath  + dir,
								headers: {
									authorization
								},
								json: true,						
								body: fileContent,
							}, function(err: any, res: { body: any; }) {
							});
						} else {
							request.put({
								url: hostPath  + dir + '/' + elementId,
								headers: {
									authorization
								},
								json: true,						
								body: fileContent,
							}, function(err: any, res: { body: any; }) {
							});
						}					
					});							
				});
		  	});
  		});
	});
}

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
		PublishInStrapi();
		vscode.window.showInformationMessage('publish on Strapi');
	});

	const disposable3 = vscode.commands.registerCommand('mrsc.pull_json',  () => {	
		const path = require('path');
		const needle = require('needle');
		const sortJson = require('sort-json');
		var filePathForSave = path.join(__dirname, '../') + 'src/';		
        var collectionTypes = [''];
		collectionTypes = [];	

		needle.get(hostPath + 'documentation', function(err: any, response: { statusCode: number; body: any; }) {
			if(err) {
				console.error(err);
			} else {
				var $ = cheerio.load(response.body);
				var scriptString = $('.custom-swagger-ui').text();
				var spec = GetSpecFromString(scriptString);
				if(spec !== 'error'){
					var apiPaths = JSON.parse(spec).paths;
					apiPaths = sortJson(apiPaths, { ignoreCase: true });
					var pathName = ' ';
					for(var elem in apiPaths){
						if(apiPaths[elem].get !== undefined && IsInJson(apiPaths, elem + '/{id}')){
							pathName = elem;
							pathName = pathName.substring(pathName.length - 1, 1);
							collectionTypes.push(pathName);
							pathName = elem;
						}				
					}
					PullInFiles(collectionTypes, hostPath, authToken, filePathForSave);
				}
			}	
		});
		vscode.window.showInformationMessage("pull json's from Strapi");
	});
	context.subscriptions.push(disposable, disposable1, disposable2, disposable3);
}

// this method is called when your extension is deactivated
export function deactivate() {}
function callback(result: any) {
	throw new Error('Function not implemented.');
}

