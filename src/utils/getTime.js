export const getTime= (timepassed) =>{
    const currentTime = new Date();
    const t = timepassed;
    const date = t?.seconds ? new Date(t.seconds * 1000) : null;

    const timeDifference = currentTime - date;
    const secondsDifference = Math.floor(timeDifference / 1000);
    const minutesDifference = Math.floor(timeDifference / (1000 * 60));
    const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
    const daysDifference = Math.floor(
      timeDifference / (1000 * 60 * 60 * 24)
    );

    let result;
    if (secondsDifference < 60) {
      result = `${secondsDifference} seconds ago`;
    } else if (minutesDifference < 60) {
      result = `${minutesDifference} minutes ago`;
    } else if (hoursDifference < 24) {
      result = `${hoursDifference} hours ago`;
    } else {
      result = `${daysDifference} days ago`;
    }
    return result;
}