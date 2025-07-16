function sortByType(directories) {
    directories.sort((a, b) => {
        if (a.type === 'directory' && b.type === 'file') {
          return -1;
        }
        if (a.type === 'file' && b.type === 'directory') {
          return 1;
        }
        return 0; 
      });
}
//shows private folder first
function sortPrivate(directories) {
  directories.sort((a, b) => {
    if (a.personal === true && !b.personal) {
      return -1;
    }
    if (!a.personal && b.personal === true) {
      return 1;
    }
    return 0; 
  });
}
export default {sortByType,sortPrivate}