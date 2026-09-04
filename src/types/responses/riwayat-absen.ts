export type RiwayatAbsenItem = {
    date: string;
    status: string;
    inpresent: string;
    outpresent: string;
    inphoto: string;
    outphoto: string;
    inmedia: "0" | "1"; // Since it seems to be a string with values "0" or "1"
    outmedia: "0" | "1";
    color: string;
  };
  
  export type RiwayatAbsenResponse = RiwayatAbsenItem[];
  