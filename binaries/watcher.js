/**
 * @file watcher.js
 * @description This file is used as a polyfill for missing functionality of bun.js fs watch on windows
 */
import { watch } from 'fs'
import WebSocket, { WebSocketServer } from 'ws';
const wss =  new WebSocketServer({ port: process.env.PORT || 3434 })
console.log('watcher started', process.env.PORT)
process.cwd = ()=>{return process.env.PWD}
globalThis.wss = wss
let folders = process.env.FOLDERS.split(',')
 
let isWriting = false

wss.on('connection', (ws) => {
    folders.forEach((folder)=>{ 
        console.log('watching folder: ', folder)
        wss.clients.forEach((client) => {
            client.send(JSON.stringify({
                type: 'init',
                folder
            }))
        })
        watch(process.cwd() + '/' + folder, { recursive: true }, (event, filename) => {
            switch(event){
                case 'change':
                   
                     wss.clients.forEach((client) => {
                        client.send(JSON.stringify({
                            type: 'change',
                            filename
                        }))
                     }) 
                    
                break;
                case 'add':
                     
                        wss.clients.forEach((client) => {
                            client.send(JSON.stringify({
                                type: 'add',
                                filename
                            }))
                        })
                     
                break;
                case 'close':
                 
                        wss.clients.forEach((client) => {
                            client.send(JSON.stringify({
                                type: 'close',
                                filename
                            }))
                        })
                    
                break;
    
                
            }
            
        })
    })
})

wss.on('close', ()=>{
    console.log('watcher closed')
})
//before closing erase the index.json file
process.on('exit', function(code) {
    console.log('About to exit with code:', code);
});