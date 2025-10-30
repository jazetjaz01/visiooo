import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "./logo";
import { Search } from "lucide-react";
import { hasEnvVars } from "@/lib/utils";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { NavAccueil } from "./nav-accueil"
const Navbar = () => {
  return (
    <div className="h-16 ">
      <nav className="   h-16     mx-auto w-full ">
        
        <div className="h-full flex items-center justify-between mx-auto px-4 ">
          
          <div className="flex items-center   md:gap-2  ">
            <div className="md:hidden">
            <NavAccueil />
            </div>
            

            <Logo  />
            <div className=" tracking-wider text-lg hidden md:block font-semibold  ">
   visiooo
  
   </div>

           
           
            
         
         
         
          </div>


          <div className="relative  gap-1 flex ">
              <Search className="h-5 w-5 absolute inset-y-0 my-auto left-2.5" />
              <Input
                className="pl-10 flex-1 bg-muted border-none shadow-none w-[210px] md:w-[560px]  rounded-full"
                placeholder="et mon compte twitter"
              />
              <Button
              size="icon"
              className="bg-muted text-foreground hover:bg-accent shadow-none rounded-full "
            >
              <Search className="h-4! w-4!" />
            </Button>
            </div>

          <div className="flex items-center gap-2 ">
            
            
             {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
