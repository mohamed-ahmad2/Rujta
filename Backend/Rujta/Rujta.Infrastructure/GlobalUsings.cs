global using System.Text;

global using Microsoft.Extensions.Logging;
global using Microsoft.Extensions.Configuration;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.IdentityModel.Tokens;
global using System.IdentityModel.Tokens.Jwt;
global using System.Security.Claims;
global using System.Security.Cryptography;
global using System.Security.Cryptography.X509Certificates;

global using AutoMapper;

global using Rujta.Application.DTOs;
global using Rujta.Application.Interfaces;
global using Rujta.Application.Interfaces.InterfaceServices;
global using Rujta.Application.Interfaces.InterfaceRepositories;
global using Rujta.Domain.Entities;
global using Rujta.Infrastructure.Constants;
global using Rujta.Infrastructure.Data;

global using Microsoft.Extensions.DependencyInjection;
global using Rujta.Application.Services;
global using Rujta.Infrastructure.BackgroundJobs;
global using Rujta.Infrastructure.Helperrs;
global using Rujta.Infrastructure.Identity.Helpers;
global using Rujta.Infrastructure.Identity.Services;
global using Rujta.Infrastructure.Repositories;
global using Rujta.Infrastructure.Services;