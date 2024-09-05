import { useFetch, e } from "vaderjs"
export default function(){ 
    let [data, loading, error ] =  useFetch("https://jsonplaceholder.typicode.com/todos/1", {})
    console.log(data, loading, error)
    return (
        <div  >
            <h1>Hello</h1>
            {loading ? "Loading" : data ? data.title : "No data"}
        </div>
    )
}