import { component, rf, include, vhtml, useRef } from "vader";

export const Home = component("Home", {
  render: async () => {
    let count = signal("count", 0);

    let counter = count.subscribe((s) => {
      console.log("count state updated", s);
      return () => {
        count.cleanup(counter);
      };
    }, false); // this is ran once
    count.call();
    count.cleanup(counter);

    function increment() {
      count.set(count.get() + 1);
    }
    rf("increment", increment);
    let home = await include("/src/views/home.html");
    return vhtml(home);
  },
  componentDidMount: () => {
    console.log("componentDidMount");
  },
});
