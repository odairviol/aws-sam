var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    let body;
    if (event.httpMethod == 'GET' && event.path == '/categoria') {
        body = await getByCategoria();
    } else if (event.httpMethod == 'GET' && event.path == '/categoriascan') {
        body = await getByCategoriaWithScan();
    } else if (event.httpMethod == 'GET' && event.path == '/hello') {
        body = await getItem();
    } else if (event.httpMethod == 'POST') {
        body = await createItem();
    } else if (event.httpMethod == 'DELETE') {
        body = await deleteItem();
    } else if (event.httpMethod == 'PUT') {
        body = await updateItem();
    }

    response = {
        'statusCode': 200,
        'body': JSON.stringify(body)
    }

    return response
};

// SCAN é mais custoso
async function getByCategoriaWithScan() {
    var params = {
        TableName: "PrimeiraTabela",
        ProjectionExpression: "id, nome",
        FilterExpression: "#categoria = :categoria and contains(nome, :nome)",
        ExpressionAttributeNames: {
            "#categoria": "categoria"
        },
        ExpressionAttributeValues: {
            ":categoria": 3,
            ":nome": 'Maria'
        }
    };
    let body;

    try {
        const data = await ddb.scan(params).promise();
        body = data.Items;
    } catch (err) {
        console.log(err);
        return err;
    }

    return body;
}

async function getByCategoria() {
    var params = {
        TableName: "PrimeiraTabela",
        IndexName: "categoria-index",
        ProjectionExpression: "id, nome",
        KeyConditionExpression: "#categoria = :categoria",
        FilterExpression: "begins_with(nome, :nome)",
        ExpressionAttributeNames: {
            "#categoria": "categoria"
        },
        ExpressionAttributeValues: {
            ":categoria": 2,
            ":nome": 'Alice'
        }
    };
    let body;

    try {
        const data = await ddb.query(params).promise();
        body = data.Items;
    } catch (err) {
        console.log(err);
        return err;
    }

    return body;
}

async function updateItem() {

    const params = {
        TableName: 'PrimeiraTabela',
        Key: { 'id': '4' },
        UpdateExpression: "set nome = :nome, categoria = :categoria",
        ExpressionAttributeValues: {
            ":nome": "Maria do Carmo",
            ":categoria": 3
        }

    };

    let body;

    try {
        const data = await ddb.update(params).promise();
        body = data.Item;
    } catch (err) {
        console.log(err);
        return err;
    }

    return body;
}

async function deleteItem() {

    const params = {
        TableName: 'PrimeiraTabela',
        Key: { 'id': '5' }
    };

    let body;

    try {
        const data = await ddb.delete(params).promise();
        body = data.Item;
    } catch (err) {
        console.log(err);
        return err;
    }

    return body;
}

async function createItem() {

    const params = {
        TableName: 'PrimeiraTabela',
        Item: {
            'id': '5',
            'nome': 'Maria Silva',
            'categoria': 2
        }
    };

    let body;

    try {
        const data = await ddb.put(params).promise();
        body = data.Item;
    } catch (err) {
        console.log(err);
        return err;
    }

    return body;

}

async function getItem() {

    const params = {
        TableName: 'PrimeiraTabela',
        Key: { 'id': '5' }
    };

    let body;

    try {
        const data = await ddb.get(params).promise();
        body = data.Item;
    } catch (err) {
        console.log(err);
        return err;
    }

    return body;
}
