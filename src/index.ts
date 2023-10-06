import { Bootstrap } from "./app/index";
import "dotenv/config"

const PORT = process.env.PORT || 8000;
async function init() {
  
  const app = await Bootstrap();
  app.listen(PORT, () => {
    console.log(`running at the ${PORT}`);
  });
}
init()
