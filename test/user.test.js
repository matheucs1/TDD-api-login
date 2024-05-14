const app = require("../src/app");
const supertest = require("supertest");
const request = supertest(app);

const mainUser = { name: "Matheus Coelho", email: "matheus@gmail.com", password: "123456" };

beforeAll(() => {

    return request.post("/user")
        .send(mainUser)
        .then(res => { })
        .catch(err => { console.log(err) });
});

afterAll(() => {
    return request.delete(`/user/${mainUser.email}`)
        .then(res => { })
        .catch(err => { console.log(err) });
});

describe("Cadastro de usuário", () => {
    test("Deve cadastrar um usuário com sucesso", () => {

        const time = Date.now();
        const email = `${time}@gmail.com`;
        const user = { name: "Matheus", email, password: "123456" };

        return request.post("/user")
            .send(user)
            .then(res => {
                expect(res.statusCode).toEqual(200);
                expect(res.body.email).toEqual(email);
            }).catch(err => {
                fail(err);
            });
    })

    test("Deve impedir que um usuário se cadastre com dados vazios", () => {
        const user = { name: "", email: "", password: "" };
        return request.post("/user")
            .send(user)
            .then(res => {
                expect(res.statusCode).toEqual(400);
            }).catch(err => {
                fail(err);
            });
    })

    test("Deve impedir que um usuário se cadastre com email repetido", () => {

        const time = Date.now();
        const email = `${time}@gmail.com`;
        const user = { name: "Matheus", email, password: "123456" };

        return request.post("/user")
            .send(user)
            .then(res => {
                expect(res.statusCode).toEqual(200);
                expect(res.body.email).toEqual(email);

                return request.post("/user")
                    .send(user)
                    .then(res => {
                        expect(res.statusCode).toEqual(400);
                        expect(res.body.error).toEqual("E-mail já cadastrado");
                    }).catch(err => {
                        fail(err)
                    })

            }).catch(err => {
                fail(err);
            });
    })
});

describe("Autenticação", () => {
    test("Deve me retornar um token quando logar", () => {
        return request.post("/auth")
            .send({ email: mainUser.email, password: mainUser.password })
            .then(res => {
                expect(res.statusCode).toEqual(200);
                expect(res.body.token).toBeDefined();
            }).catch(err => {
                fail(err);
            })
    });

    test("Deve impedir que um usuário não cadastrado se logue", () => {
        return request.post("/auth")
        .send({ email: "emaillalala@gmail.com", password: "13451335464" })
        .then(res => {
            expect(res.statusCode).toEqual(403);
            expect(res.body.errors.email).toEqual("E-mail não cadastrado");
        }).catch(err => {
            fail(err);
        })

    });

    test("Deve impedir que um usuário se logue com uma senha errada", () => {
        return request.post("/auth")
        .send({ email: mainUser.email, password: "ashalalala" })
        .then(res => {
            expect(res.statusCode).toEqual(403);
            expect(res.body.errors.password).toEqual("Senha incorreta");
        }).catch(err => {
            fail(err);
        })

    });

});