import { db } from "../utils/firebase";
import { doc, updateDoc, arrayUnion, query, collection, where, getDocs } from "firebase/firestore";

export const updateNotification = async (post_id, data) => {
  const q = query(collection(db, "users"), where("uid", "==", post_id));
  const docs = await getDocs(q);
  let id = '-1';

   //id = docs.docs[0].id                 <-----------------Alternative
   docs.docs.forEach((X) => id = X.id );  //just have to do this to get the doc.id of this specific doc

//Now that the user is found 
  if(id !== '-1'){
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, { notification: arrayUnion(data) });
  }
 
};
