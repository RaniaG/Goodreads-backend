const casl = require('@casl/ability');
function defineAbilityForAdmin() {
    const { AbilityBuilder, Ability } = casl;
    const { rules, can, cannot } = AbilityBuilder.extract()

    can(['delete', 'add', 'update', 'getAll'], 'books');
    cannot(['rate', 'updateStatus', 'getById', 'getOwn'], 'books');

    can(['delete', 'add', 'update', 'getAll'], 'author');
    cannot('getById', 'author');

    can(['delete', 'add', 'update', 'getAll'], 'category');

    cannot(['getInfo', 'getAll', 'update', 'updatePassword', 'updatePhoto', 'delete', 'create'], 'user');

    return new Ability(rules)
}
module.exports = defineAbilityForAdmin;