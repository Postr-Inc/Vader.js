import { component, rf, include, vhtml, useRef } from "vader";


export  const Home = component('Home', {
   
    render: async () => {
        let [count, setCount] = useState('count', 0)

        useEffect(() => {
            console.log('count', count)
        }, ['count'])

        function increment() {
            setCount(count + 1)
        }
        rf('increment', increment)
        let home  = await include('/src/views/home.html')
        return vhtml(home)
    },
    componentDidMount: () => {
        console.log('componentDidMount')
    },
})