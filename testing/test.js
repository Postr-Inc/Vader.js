import { render, vhtml,   registerFunction,   useAuth,  form, useSyncStore, useEffect,useExternalStore, createComponent, $s, useState } from '../vader.js';
import VaderRouter from '../vaderRouter.js';
const login = async () => {
    let [user, setUser] =  useState('user', {})
   
   
   const userForm = await form({
     name: 'userForm',
     fields:{
         email: {
                type: 'email',
                required: true,
                value: '',
                error: '',
                placeholder: 'Email',
                label: 'Email',
         },
            password: {
                type: 'password',
                required: true,
                placeholder: 'Password',
                value: '',
                error: '',
            }
     },
     onSubmit: async (e) => {
        setUser(e)
 
        
       e.reset()
     },
     inputs:{
       email: {
         width: '100%',
         padding: '12px 20px',
         'box-sizing': 'border-box'
       },
       password:{
         width: '100%',
          padding: '12px 20px',
         'box-sizing': 'border-box',
         marginTop: '10px',
       }
     },
     button: {
         text: 'Login',
         styles:{
            border: 'none',
            borderRadius: '5px',
            width: '100%',
            padding: '12px 20px',
            marginTop: '10px',
            cursor: 'pointer',
         }
     },
    
   })
   function logout (){
         setUser('')
   }
   registerFunction('logout', logout)
   if(user ){
    return vhtml `
     <div style="display: flex; flex-direction: column; gap: 10px; align-items: center;">
        <h1>Logged in as ${user.email}</h1>
        <button style="border: none; border-radius: 5px; padding: 10px 20px; cursor: pointer;" onclick="logout(), console.log('loggingout')">Logout</button>
    </div>
    `
}else{
    return vhtml`
    <div
    ${$s(styles.container)}
    >
     ${await userForm.render()}
    </div>
    `;
}
};
const styles = {
    container: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '20px',
    }
}
// Create a component instance
const App = async (props) => {
    let loginEl = await createComponent(login);
   
    return vhtml`
        <div
         
        >
            <h1>${props.title}</h1>
            ${loginEl}
            <p>App content</p>
        </div>
    `;
};
const app = new VaderRouter('/home');
app.use('/home')
app.get('/home', async () => {
    render({
        selector: '#app',
        rt: async () => await App({ title: 'Vader.js Example' }),
    }).then((app) => {
        app.register();
    });
});
app.on('/home', async (req) => {
    let params = req.params;
    render({
        selector: '#app',
        rt: async () => await App({ title: 'Vader.js Example' }),
    }).then((app) => {
        app.register();
    });
})
app.handleErrors('404', (err) => {
    document.querySelector('#app').innerHTML = `<h1>${err.message}</h1>`;
});
app.start()
// Render the App component
 
