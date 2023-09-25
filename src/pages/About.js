import { component, rf, include, vhtml, useRef } from "vader";

export const About = component("About", {
  render: async (state) => {
    let a = await include("/src/views/about.html");
    return vhtml(a);
  },
  componentDidMount: () => {
    console.log("componentDidMount");
  },
});
