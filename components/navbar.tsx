import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "./logo";
import { Search } from "lucide-react";
import { hasEnvVars } from "@/lib/utils";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
const Navbar = () => {
  return (
    <div className="h-16 bg-white">
      <nav className="fixed  inset-x-4 h-16 bg-background  dark:border-slate-700/70 pl-4  pr-4 mx-auto w-full ">
        
        <div className="h-full flex items-center justify-between mx-auto px-4 ">
          
          <div className="flex items-center gap-2 md:gap-2  pl-2">
            <Logo  />
            <div className=" tracking-wider text-lg hidden md:block font-semibold  ">
   visiooo
  
   </div>

           
           
            
         
         
         
          </div>


          <div className="relative ">
              <Search className="h-5 w-5 absolute inset-y-0 my-auto left-2.5" />
              <Input
                className="pl-10 flex-1 bg-muted border-none shadow-none w-[280px] md:w-[560px]  rounded-full"
                placeholder="et mon compte twitter"
              />
            </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              className="bg-muted text-foreground hover:bg-accent shadow-none rounded-full md:hidden"
            >
              <Search className="h-5! w-5!" />
            </Button>
            
             {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
