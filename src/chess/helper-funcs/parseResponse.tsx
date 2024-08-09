// Response in format:

//Name: <Piece Name (str)>
//Emoji: <Emoji (str)>
//Health: <Health (int)>
//Movement: <Movement pattern; fixed, line, diagonal, any, custom>
//Attack: <Attack pattern; fixed, line, diagonal, any, custom>
//Traits: <Traits (str)>


function parseResponse(response) {
    let responseArray = response.split("\n");
    let piece = {};
    responseArray.forEach((line) => {
        let splitLine = line.split(": ");
        let key = splitLine[0];
        let value = splitLine[1];
        piece[key] = value;
    });
    return piece;
}