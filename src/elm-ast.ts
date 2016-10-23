/**
 * Copyright (c) 2016, John Hewson
 * All rights reserved.
 */

// types

export abstract class ElmType {}

export class ElmTypeName extends ElmType {
  constructor(public name: string) {
    super();
  }
}

export class ElmTypeApp  extends ElmType {
  constructor(public name: string, public args: Array<ElmType>) {
    super();
  }
}

export class ElmTypeRecord  extends ElmType {
  constructor(public fields: Array<ElmFieldDecl>, public typeParam?: string) {
    super();
  }
}

// decls

export abstract class ElmDecl {}

export class ElmTypeDecl extends ElmDecl {
  constructor(public name: string,
              public constructors: Array<string>) {
    super();
  }
}

export class ElmTypeAliasDecl extends ElmDecl {
  constructor(public name: string,
              public type: ElmType,
              public typeParams: Array<string> = []) {
    super();
  }
}

export class ElmFunctionDecl extends ElmDecl {
  constructor(public name: string,
              public parameters: Array<ElmParameterDecl>,
              public returnType: ElmType,
              public body: ElmExpr) {
    super();
  }
}

export class ElmFieldDecl {
  constructor(public name: string,
              public type: ElmType) {}
}

export class ElmParameterDecl {
  constructor(public name: string,
              public type: ElmType) { }
}

// expressions

export interface ElmExpr {
  expr: string; // todo: expression trees
}

export function moduleToString(name: string, expose: Array<string>, imports: Array<string>,
                            decls: Array<ElmDecl>) {
  let warn = '{-\n    This file was automatically generated by elm-graphql.\n-}\n';
  return warn + 'module ' + name + ' exposing (' + expose.join(', ') + ')\n' +
    imports.map(str => '\nimport ' + str).join('') + '\n\n' +
    decls.map(declToString).join('\n\n');
}

export function declToString(decl: ElmDecl): string {
  if (decl instanceof ElmTypeDecl) {
    return typeDeclToString(decl);
  } else if (decl instanceof ElmFunctionDecl) {
    return funtionToString(decl);
  } else if (decl instanceof ElmTypeAliasDecl) {
    return typeAliasDeclToString(decl);
  } else {
    throw new Error('unexpected decl: ' + decl.constructor.name + ' ' + JSON.stringify(decl));
  }
}

export function typeDeclToString(type: ElmTypeDecl): string {
  return 'type ' + type.name + '\n' +
    '    = ' + type.constructors.join('\n    | ') + '\n';
}

export function typeAliasDeclToString(type: ElmTypeAliasDecl): string {
  return 'type alias ' + type.name + ' ' + type.typeParams.join(' ') + '\n' +
    '    = ' + typeToString(type.type, 0) + '\n';
}

export function funtionToString(func: ElmFunctionDecl): string {
  let paramTypes = func.parameters.map(p => typeToString(p.type, 1)).join(' -> ');
  let paramNames = func.parameters.map(p => p.name).join(' ');
  let arrow = paramTypes.length > 0 ? ' -> ' : '';
  let space = paramTypes.length > 0 ? ' ' : '';
  return func.name + ' : ' + paramTypes + arrow + typeToString(func.returnType, 0) + '\n' +
         func.name + space + paramNames + ' =\n    ' + exprToString(func.body, 0) + '\n';
}

function fieldToString(field: ElmFieldDecl, level: number): string {
  return field.name + ' : ' + typeToString(field.type, level, true) + '\n';
}

export function typeToString(ty: ElmType, level: number, isField?: boolean): string {
  if (ty instanceof ElmTypeName) {
    return ty.name;
  } else if (ty instanceof ElmTypeApp) {
    let str = ty.name + ' ' + ty.args.map(arg => typeToString(arg, level)).join(' ');
    if (isField) {
      return str;
    } else {
      return '(' + str + ')';
    }
  } else if (ty instanceof ElmTypeRecord) {
    let indent = makeIndent(level);
    let pipe = ty.typeParam ? ty.typeParam + ' | ' : '';
    return `${indent}{ ` + pipe +
            ty.fields.map(f => fieldToString(f, level + 1)).join(`${indent}, `) +
            `${indent}}`;
  } else {
    console.error('unexpected type: ' +  JSON.stringify(ty)); 
  }
}

function makeIndent(level: number) {
  let str = '';
  for (let i = 0; i < level; i++) {
    str += '    ';
  }
  return str;
}

export function exprToString(expr: ElmExpr, level: number): string {
  return expr.expr; // todo: expression trees
}
